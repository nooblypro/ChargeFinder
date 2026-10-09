import { getJson } from 'serpapi';
import { StationRecord } from './overpassService.js';

export interface EntityCandidate {
  title: string;
  placeId?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  lat?: number;
  lng?: number;
  distanceKm: number;
  score: number;
  popular_times?: any[];
  user_reviews?: any[];
}

export type EntityResolutionResult =
  | { status: 'unverified_location'; message: string }
  | { status: 'serpapi_error'; error: string }
  | { status: 'identity_ambiguous'; message: string; candidates: EntityCandidate[] }
  | { status: 'no_confident_match'; message: string }
  | { status: 'resolved'; candidate: EntityCandidate; score: number };

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTokenSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 1);

  const tokens1 = new Set(normalize(str1));
  const tokens2 = new Set(normalize(str2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach((t) => {
    if (tokens2.has(t)) intersection++;
  });

  return intersection / Math.max(tokens1.size, tokens2.size);
}

export function rankAndResolveCandidates(
  placeResults: any[],
  station: StationRecord
): EntityResolutionResult {
  if (!placeResults || placeResults.length === 0) {
    return {
      status: 'no_confident_match',
      message: 'SerpApi returned zero local map results for station.',
    };
  }

  // Rank candidate places with strict 2.0 km cutoff & S = (1 - min(d / 2.0, 1.0)) * 0.4 + s * 0.6
  const scoredCandidates: EntityCandidate[] = [];

  for (const p of placeResults) {
    const title = p.title || p.name || '';
    const cLat = p.gps_coordinates?.latitude ?? p.latitude;
    const cLon = p.gps_coordinates?.longitude ?? p.longitude;

    if (!cLat || !cLon) continue;

    const dist = haversineKm(station.lat, station.lon, cLat, cLon);

    // Strict 2.0 km cutoff
    if (dist > 2.0) {
      continue;
    }

    const nameSim = calculateTokenSimilarity(station.name, title);
    const distScore = 1.0 - Math.min(dist / 2.0, 1.0);

    // S = distScore * 0.4 + nameSim * 0.6
    const totalScore = distScore * 0.4 + nameSim * 0.6;

    scoredCandidates.push({
      title,
      placeId: p.place_id || p.data_id,
      address: p.address,
      rating: p.rating,
      reviews: p.reviews,
      lat: cLat,
      lng: cLon,
      distanceKm: Math.round(dist * 100) / 100,
      score: Math.round(totalScore * 1000) / 1000,
      popular_times: p.popular_times,
      user_reviews: p.user_reviews || p.reviews_original,
    });
  }

  if (scoredCandidates.length === 0) {
    return {
      status: 'no_confident_match',
      message: 'No candidate place found within the strict 2.0 km boundary.',
    };
  }

  // Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  const s1 = scoredCandidates[0];
  const s2 = scoredCandidates[1];

  if (!s1 || s1.score < 0.35) {
    return {
      status: 'no_confident_match',
      message: `Top candidate score (${s1?.score ?? 0}) below minimum threshold 0.35.`,
    };
  }

  // Strict Ambiguity Guard: |S1 - S2| < 0.05
  if (s2 && s2.score >= 0.30 && Math.abs(s1.score - s2.score) < 0.05) {
    console.warn(`[Ambiguity Guard] Halted resolution for station '${station.name}': Top 2 candidates have near-identical score diff (${(s1.score - s2.score).toFixed(3)} < 0.05)`);
    return {
      status: 'identity_ambiguous',
      message: `Multiple top candidate places match with near-identical confidence scores (|S1 - S2| = ${(s1.score - s2.score).toFixed(3)} < 0.05). Search halted for ambiguity safety.`,
      candidates: [s1, s2],
    };
  }

  return {
    status: 'resolved',
    candidate: s1,
    score: s1.score,
  };
}

export async function resolveStationEntity(
  station: StationRecord,
  apiKey?: string
): Promise<EntityResolutionResult> {
  // 1. Unverified Location Guard Check
  if (!station.directory_record_verified) {
    return {
      status: 'unverified_location',
      message: 'Location coordinates unverified; live SerpApi queries suppressed to prevent search pollution.',
    };
  }

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_SERPAPI_KEY' || apiKey === 'INVALID_KEY') {
    return {
      status: 'serpapi_error',
      error: 'SerpApi Maps search failed before candidate resolution.',
    };
  }

  try {
    const query = `${station.name} ${station.operator ? station.operator : ''} EV charging`.trim();
    const ll = `@${station.lat},${station.lon},15z`;

    let searchResults: any = null;
    try {
      searchResults = await getJson({
        engine: 'google_maps',
        q: query,
        ll,
        type: 'search',
        api_key: apiKey,
      });

      if (!searchResults || searchResults.error) {
        console.error("SerpApi Internal Error:", searchResults?.error || "No response received");
        return {
          status: 'serpapi_error',
          error: 'SerpApi Maps search failed before candidate resolution.',
        };
      }
    } catch (err: any) {
      console.error("SerpApi Internal Error:", err?.error || err?.message || err);
      return {
        status: 'serpapi_error',
        error: 'SerpApi Maps search failed before candidate resolution.',
      };
    }

    const placeResults: any[] = searchResults?.local_results || searchResults?.places || [];
    return rankAndResolveCandidates(placeResults, station);
  } catch (err: any) {
    console.warn('[Entity Resolution Error]:', err?.message || err);
    return {
      status: 'serpapi_error',
      error: 'SerpApi Maps search failed before candidate resolution.',
    };
  }
}
