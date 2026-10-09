import { Router, Request, Response } from 'express';
import { fetchTamilNaduDirectory, StationRecord } from '../services/overpassService.js';
import { resolveStationEntity } from '../services/entityResolution.js';
import { HUB_CONFIGS } from '../data/hubConfigs.js';
import { apiCache } from '../cache/cache.js';
import { fetchPlaceReviews } from '../services/serpapiService.js';

export const frictionRouter = Router();

/**
 * GET /api/friction/:station_id
 * On-Demand Friction Intelligence for statewide directory stations
 */
frictionRouter.get('/:station_id', async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.station_id;
  const stationId = Array.isArray(rawId) ? rawId[0] : rawId;
  const apiKey = process.env.SERPAPI_API_KEY;
  const refresh = req.query.refresh === 'true';

  const cacheKey = `friction_${stationId}`;
  if (refresh) {
    apiCache.del(cacheKey);
  } else {
    const cachedData = apiCache.get<any>(cacheKey);
    if (cachedData) {
      res.status(200).json({
        ...cachedData,
        _meta: {
          ...cachedData._meta,
          cached: true,
        },
      });
      return;
    }
  }

  // 1. Find station from directory or hubConfigs
  let station: StationRecord | null = null;

  // Check hubConfigs first (e.g. stop_a, stop_b, stop_c, stop_d)
  if (HUB_CONFIGS[stationId]) {
    const hub = HUB_CONFIGS[stationId];
    station = {
      id: hub.id,
      name: hub.name,
      lat: hub.coordinates.lat,
      lon: hub.coordinates.lng,
      operator: hub.name.split(' ')[0] || 'Unknown',
      source: 'openstreetmap_overpass',
      directory_record_verified: true,
      operational_status: 'unknown',
    };
  } else {
    // Search Tamil Nadu Directory
    const directory = await fetchTamilNaduDirectory();
    const found = directory.stations.find((s) => s.id === stationId);
    if (found) {
      station = found;
    }
  }

  if (!station) {
    res.status(200).json({
      status: 'unassessed',
      station_id: stationId,
      message: `Station ID '${stationId}' not found in directory.`,
    });
    return;
  }

  // 2. Unverified Location Guard Check
  if (!station.directory_record_verified) {
    res.status(200).json({
      status: 'unverified_location',
      station_id: stationId,
      station,
      message: 'Location coordinates unverified; live SerpApi search suppressed to prevent search pollution.',
    });
    return;
  }

  // 3. Entity Resolution with Ambiguity Guard
  const resolution = await resolveStationEntity(station, apiKey);

  if (resolution.status === 'serpapi_error') {
    res.status(200).json({
      status: 'serpapi_error',
      station_id: stationId,
      station,
      error: resolution.error,
    });
    return;
  }

  if (resolution.status === 'identity_ambiguous') {
    res.status(200).json({
      status: 'identity_ambiguous',
      station_id: stationId,
      station,
      message: resolution.message,
      candidates: resolution.candidates,
    });
    return;
  }

  if (resolution.status === 'no_confident_match') {
    res.status(200).json({
      status: 'no_confident_match',
      station_id: stationId,
      station,
      message: resolution.message,
    });
    return;
  }

  if (resolution.status === 'unverified_location') {
    res.status(200).json({
      status: 'unverified_location',
      station_id: stationId,
      station,
      message: resolution.message,
    });
    return;
  }

  // 4. Assessed Match: Strict Evidence Pipeline & Dedicated Reviews Query
  const candidate = resolution.candidate;
  const nowIso = new Date().toISOString();

  // Step 1: Strict Popular Times check
  const popTimes = candidate.popular_times as any;
  const hasPopularTimes = Boolean(
    popTimes &&
      (popTimes.graph_results || (Array.isArray(popTimes) && popTimes.length > 0))
  );
  const hasRatingOrReviews = Boolean(candidate.rating || (candidate.reviews && candidate.reviews > 0));

  const venue_pressure = (hasPopularTimes || hasRatingOrReviews)
    ? {
        available: true,
        r_value: candidate.rating ? Math.max(0, Math.round(((5 - candidate.rating) / 5) * 100) / 100) : 0.2,
        c_value: 0.85,
        source: 'google_maps_popular_times',
        retrieved_at: nowIso,
        provenance: 'Google Maps Popular Times',
        label: 'Venue Pressure Proxy',
        text: 'Google Maps Popular Times graph data active',
      }
    : {
        available: false,
        r_value: null,
        c_value: 0.0,
        source: 'google_maps_popular_times',
        retrieved_at: nowIso,
        provenance: 'Unavailable',
        label: 'Venue Pressure Proxy',
        text: 'Popular Times data was not returned for this place.',
      };

  // Step 2: Refined Hardware Warnings Logic (State A / State B / State C)
  let hardware_warnings: any = {
    available: false,
    r_value: null,
    c_value: 0.0,
    source: 'google_maps_reviews',
    retrieved_at: nowIso,
    provenance: 'Unavailable',
    label: 'Review-derived warning pattern',
    text: 'No usable review evidence was returned.',
    review_count: 0,
    matched_warning_count: 0,
  };

  if (candidate.placeId || candidate.reviews) {
    let reviewList: any[] = [];
    if (candidate.placeId) {
      const reviewsData = await fetchPlaceReviews(candidate.placeId, apiKey);
      if (reviewsData && (reviewsData.reviews || reviewsData.user_reviews)) {
        reviewList = reviewsData.reviews || reviewsData.user_reviews || [];
      }
    }

    const reviewCount = reviewList.length || candidate.reviews || 0;

    if (reviewCount > 0) {
      const warningKeywords = ['broken', 'down', 'fault', 'offline', 'error', 'failed', 'issue', 'slow', 'stopped', 'not working', 'repair'];
      const matchedWarnings: string[] = [];

      for (const r of reviewList) {
        const snippet = (r.snippet || r.text || r.caption || '').toLowerCase();
        for (const kw of warningKeywords) {
          if (snippet.includes(kw) && !matchedWarnings.includes(kw)) {
            matchedWarnings.push(kw);
          }
        }
      }

      if (matchedWarnings.length > 0) {
        // State C: Warning Reviews
        hardware_warnings = {
          available: true,
          r_value: 0.35,
          c_value: 0.85,
          source: 'google_maps_reviews',
          retrieved_at: nowIso,
          provenance: 'Google Maps Reviews',
          label: 'Review-derived warning pattern',
          text: 'Relevant warning mentions detected.',
          review_count: reviewCount,
          matched_warning_count: matchedWarnings.length,
          matched_patterns: matchedWarnings,
        };
      } else {
        // State B: Clean Reviews
        hardware_warnings = {
          available: true,
          r_value: 0.0,
          c_value: 0.75,
          source: 'google_maps_reviews',
          retrieved_at: nowIso,
          provenance: 'Google Maps Reviews',
          label: 'Review-derived warning pattern',
          text: 'Reviews were analyzed; no charger-related warning pattern was found.',
          review_count: reviewCount,
          matched_warning_count: 0,
        };
      }
    }
  }

  // Macro context signals
  const regional_signal = {
    available: true,
    r_value: 0.1,
    c_value: 0.7,
    source: 'google_trends',
    retrieved_at: nowIso,
    provenance: 'Inferred',
    label: 'Macro Regional Search Signal',
    specificity: 'low',
    text: 'Low specificity — does not directly describe this station.',
  };

  const corridor_alerts = {
    available: true,
    r_value: 0.1,
    c_value: 0.6,
    source: 'google_news',
    retrieved_at: nowIso,
    provenance: 'Unverified',
    label: 'Corridor Alerts',
    specificity: 'low',
    text: 'Low specificity — does not directly describe this station.',
  };

  const signals = {
    venue_pressure,
    hardware_warnings,
    regional_signal,
    corridor_alerts,
  };

  // Score Math Calculation
  const weightMap = {
    venue_pressure: 0.35,
    hardware_warnings: 0.45,
    regional_signal: 0.10,
    corridor_alerts: 0.10,
  };

  const csds_components = {
    venue_pressure: {
      weight: signals.venue_pressure.available ? 0.35 : 0,
      risk: signals.venue_pressure.available ? signals.venue_pressure.r_value : null,
      source: signals.venue_pressure.source,
      retrieved_at: signals.venue_pressure.retrieved_at,
    },
    hardware_warnings: {
      weight: signals.hardware_warnings.available ? 0.45 : 0,
      risk: signals.hardware_warnings.available ? signals.hardware_warnings.r_value : null,
      source: signals.hardware_warnings.source,
      retrieved_at: signals.hardware_warnings.retrieved_at,
    },
    regional_signal: {
      weight: 0.10,
      risk: 0.1,
      source: signals.regional_signal.source,
      retrieved_at: signals.regional_signal.retrieved_at,
    },
    corridor_alerts: {
      weight: 0.10,
      risk: 0.1,
      source: signals.corridor_alerts.source,
      retrieved_at: signals.corridor_alerts.retrieved_at,
    },
  };

  let ecsSum = 0;
  for (const key of Object.keys(signals) as (keyof typeof signals)[]) {
    const sig = signals[key];
    const w = weightMap[key];
    ecsSum += w * (sig.c_value ?? 0);
  }
  const ecs = Math.round(100 * ecsSum);

  let csds: number | null = null;
  let recommendation = 'Verify First';

  if (ecs >= 55) {
    let availableWeightSum = 0;
    let numeratorSum = 0;
    for (const key of Object.keys(signals) as (keyof typeof signals)[]) {
      const sig = signals[key];
      const w = weightMap[key];
      if (sig.available && sig.r_value !== null) {
        numeratorSum += w * (1 - sig.r_value);
        availableWeightSum += w;
      }
    }
    if (availableWeightSum > 0) {
      csds = Math.round(100 * (numeratorSum / availableWeightSum) * 10) / 10;
      recommendation = csds >= 75 ? 'Recommended' : csds >= 50 ? 'Caution' : 'Avoid / Verify First';
    }
  }

  const responsePayload = {
    status: 'assessed',
    station_id: stationId,
    station,
    candidate,
    assessment_source: 'serpapi',
    csds,
    ecs,
    recommendation,
    signals,
    csds_components,
    weights: weightMap,
    _meta: {
      cached: false,
      source: 'serpapi',
    },
  };

  apiCache.set(cacheKey, responsePayload, 600);
  res.status(200).json(responsePayload);
});
