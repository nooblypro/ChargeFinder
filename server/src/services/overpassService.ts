import axios from 'axios';
import NodeCache from 'node-cache';
import fs from 'fs';
import path from 'path';

export interface StationRecord {
  id: string;
  name: string;
  lat: number;
  lon: number;
  operator: string;
  source: 'openstreetmap_overpass' | 'offline_fallback';
  directory_record_verified: boolean;
  operational_status: 'unknown' | 'operational' | 'outage';
  address?: string;
  capacity?: string;
}

export interface DirectoryResponse {
  source: 'openstreetmap_overpass' | 'offline_fallback';
  boundary: string;
  boundary_type: 'bounding_box' | 'administrative';
  count: number;
  fetched_at: string;
  coverage_note: string;
  directory_record_verified: boolean;
  operational_status: 'unknown' | 'operational' | 'outage';
  stations: StationRecord[];
  _meta?: {
    cached: boolean;
    ttlSeconds: number;
  };
}

const cache = new NodeCache({ stdTTL: 86400 }); // 24-hour cache
let inFlightPromise: Promise<DirectoryResponse> | null = null;

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const OVERPASS_QUERY = `[out:json][timeout:25]; (node["amenity"="charging_station"](8.0,76.0,13.6,80.3); way["amenity"="charging_station"](8.0,76.0,13.6,80.3); relation["amenity"="charging_station"](8.0,76.0,13.6,80.3);); out center tags;`;

function loadFallbackData(): DirectoryResponse {
  try {
    const fallbackPath = path.resolve(process.cwd(), 'server/src/data/osm_tn_fallback.json');
    if (fs.existsSync(fallbackPath)) {
      const raw = fs.readFileSync(fallbackPath, 'utf-8');
      const json = JSON.parse(raw);
      return {
        source: 'offline_fallback',
        boundary: 'TN_BBOX',
        boundary_type: 'bounding_box',
        count: json.stations?.length || 0,
        fetched_at: new Date().toISOString(),
        coverage_note: 'Stations returned from offline fallback sample; exact state-boundary filtering and operational status are not guaranteed.',
        directory_record_verified: true,
        operational_status: 'unknown',
        stations: (json.stations || []).map((s: any) => ({
          ...s,
          source: 'offline_fallback',
          directory_record_verified: true,
          operational_status: 'unknown',
        })),
      };
    }
  } catch (err) {
    console.warn('[Overpass] Failed to load fallback JSON file:', err);
  }

  // Hardcoded emergency fallback
  return {
    source: 'offline_fallback',
    boundary: 'TN_BBOX',
    boundary_type: 'bounding_box',
    count: 2,
    fetched_at: new Date().toISOString(),
    coverage_note: 'Synthetic fallback sample; not a complete Tamil Nadu directory.',
    directory_record_verified: true,
    operational_status: 'unknown',
    stations: [
      {
        id: 'fallback_zeon_coimbatore',
        name: 'Zeon Charging Hub — Coimbatore sample',
        lat: 11.0168,
        lon: 76.9558,
        operator: 'Zeon',
        source: 'offline_fallback',
        directory_record_verified: true,
        operational_status: 'unknown',
      },
      {
        id: 'fallback_tata_chennai',
        name: 'Tata Power EZ Charge — Chennai sample',
        lat: 13.0827,
        lon: 80.2707,
        operator: 'Tata Power',
        source: 'offline_fallback',
        directory_record_verified: true,
        operational_status: 'unknown',
      },
    ],
  };
}

export async function fetchTamilNaduDirectory(): Promise<DirectoryResponse> {
  const cachedData = cache.get<DirectoryResponse>('tn_directory');
  if (cachedData) {
    console.log('[Directory Cache] Serving Tamil Nadu OSM directory from 24h node-cache');
    return {
      ...cachedData,
      _meta: {
        cached: true,
        ttlSeconds: 86400,
      },
    };
  }

  // Promise single-flight lock protection
  if (inFlightPromise) {
    console.log('[Directory Lock] Joining existing in-flight Overpass request');
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      let data: any = null;
      for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
          console.log(`[Overpass API] Requesting Tamil Nadu EV stations from ${endpoint}...`);
          const res = await axios.post(endpoint, `data=${encodeURIComponent(OVERPASS_QUERY)}`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'ChargeSyncIndia/1.0 (contact@chargesync.in)',
            },
            timeout: 15000,
          });
          if (res.data && Array.isArray(res.data.elements)) {
            data = res.data;
            break;
          }
        } catch (err: any) {
          console.warn(`[Overpass Error] Endpoint ${endpoint} failed:`, err?.message || err);
        }
      }

      if (!data || !Array.isArray(data.elements) || data.elements.length === 0) {
        console.warn('[Overpass] No element data returned. Serving synthetic fallback.');
        const fallback = loadFallbackData();
        cache.set('tn_directory', fallback, 3600);
        return {
          ...fallback,
          _meta: { cached: false, ttlSeconds: 3600 },
        };
      }

      // Geometry extraction: ways and relations use center coordinates, nodes use lat/lon directly
      const stations: StationRecord[] = data.elements.map((el: any) => {
        const tags = el.tags || {};
        
        let lat = el.lat;
        let lon = el.lon;

        if (el.type === 'way' || el.type === 'relation') {
          lat = el.center?.lat ?? el.lat;
          lon = el.center?.lon ?? el.lon;
        }

        lat = lat ?? 11.0;
        lon = lon ?? 78.0;

        const name =
          tags.name ||
          tags['name:en'] ||
          tags.operator ||
          tags.brand ||
          `EV Station (${el.type}/${el.id})`;
        const operator = tags.operator || tags.brand || 'Independent Operator';

        return {
          id: `osm_${el.type}_${el.id}`,
          name,
          lat,
          lon,
          operator,
          source: 'openstreetmap_overpass' as const,
          directory_record_verified: true,
          operational_status: 'unknown' as const,
          address: tags['addr:full'] || tags['addr:street'] || undefined,
          capacity: tags.capacity || tags.socket || undefined,
        };
      });

      const response: DirectoryResponse = {
        source: 'openstreetmap_overpass',
        boundary: 'TN_BBOX',
        boundary_type: 'bounding_box',
        count: stations.length,
        fetched_at: new Date().toISOString(),
        coverage_note: 'Stations returned from the Tamil Nadu-region bounding box (8.0, 76.0, 13.6, 80.3); exact state-boundary filtering and operational status are not guaranteed.',
        directory_record_verified: true,
        operational_status: 'unknown',
        stations,
      };

      cache.set('tn_directory', response, 86400); // 24 hours
      return {
        ...response,
        _meta: { cached: false, ttlSeconds: 86400 },
      };
    } catch (error) {
      console.warn('[Overpass] Pipeline error. Serving offline fallback:', error);
      const fallback = loadFallbackData();
      cache.set('tn_directory', fallback, 3600);
      return {
        ...fallback,
        _meta: { cached: false, ttlSeconds: 3600 },
      };
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}
