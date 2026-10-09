import { Router, Request, Response } from 'express';
import { HUB_CONFIGS, StopResponseContract } from '../data/hubConfigs.js';
import { getCachedStopPayload, setCachedStopPayload, clearStopCache } from '../cache/cache.js';
import { fetchSerpApiSignalsForHub } from '../services/serpapiService.js';
import { transformSerpToSignals } from '../transformers/signalTransformer.js';

export const stopsRouter = Router();

/**
 * GET /api/stops/:stopId
 * Returns raw 4-signal JSON payload for a given stopId (stop_a, stop_b, stop_c).
 * Enforces node-cache (10-minute TTL) and fail-safe static fallback for hackathon demo resilience.
 */
stopsRouter.get('/:stopId', async (req: Request, res: Response): Promise<void> => {
  const rawStopId = req.params.stopId;
  const stopId = Array.isArray(rawStopId) ? rawStopId[0] : rawStopId;
  const hub = HUB_CONFIGS[stopId];

  if (!hub) {
    res.status(404).json({
      error: 'STOP_NOT_FOUND',
      message: `Stop ID '${stopId}' is invalid. Supported stops are: stop_a, stop_b, stop_c`,
    });
    return;
  }

  // 1. Check Hard Cache
  const cachedPayload = getCachedStopPayload<StopResponseContract>(stopId);
  if (cachedPayload) {
    console.log(`[CACHE HIT] Serving stop payload for '${stopId}' from node-cache`);
    res.json({
      ...cachedPayload,
      _meta: {
        cached: true,
        ttlSeconds: 600,
        source: 'node-cache',
      },
    });
    return;
  }

  // 2. Cache Miss: Dispatch SerpApi with Fail-Safe Try/Catch Boundary
  console.log(`[CACHE MISS] Fetching signals for '${stopId}'...`);
  
  try {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey || apiKey === 'INVALID_KEY' || apiKey === 'YOUR_SERPAPI_KEY') {
      console.warn(`[DEMO MODE] SerpApi failed, serving static fallback for ${stopId}`);
      const fallbackData = {
        ...hub.fallbackFixture,
        _meta: {
          cached: false,
          ttlSeconds: 600,
          source: 'static-fallback',
        },
      };
      setCachedStopPayload(stopId, fallbackData, 600);
      res.status(200).json(fallbackData);
      return;
    }

    const serpResults = await fetchSerpApiSignalsForHub(hub, apiKey);

    // If SerpApi execution failed or returned null for all engines, serve static fallback
    if (!serpResults.mapsData && !serpResults.reviewsData && !serpResults.trendsData && !serpResults.newsData) {
      console.warn(`[DEMO MODE] SerpApi returned no valid data for ${stopId}, serving static fallback`);
      const fallbackData = {
        ...hub.fallbackFixture,
        _meta: {
          cached: false,
          ttlSeconds: 600,
          source: 'static-fallback',
        },
      };
      setCachedStopPayload(stopId, fallbackData, 600);
      res.status(200).json(fallbackData);
      return;
    }

    const responsePayload = transformSerpToSignals(hub, serpResults);

    const livePayload = {
      ...responsePayload,
      _meta: {
        cached: false,
        ttlSeconds: 600,
        source: 'serpapi_live',
      },
    };

    setCachedStopPayload(stopId, livePayload, 600);
    res.status(200).json(livePayload);
  } catch (error) {
    console.warn(`[DEMO MODE] SerpApi failed, serving static fallback for ${stopId}:`, error);
    const fallbackData = {
      ...hub.fallbackFixture,
      _meta: {
        cached: false,
        ttlSeconds: 600,
        source: 'static-fallback',
      },
    };
    res.status(200).json(fallbackData);
  }
});

/**
 * GET /api/stops
 * Returns all 3 demo stops array
 */
stopsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const stopKeys = Object.keys(HUB_CONFIGS);
  const apiKey = process.env.SERPAPI_API_KEY;

  const results = await Promise.all(
    stopKeys.map(async (key) => {
      const cached = getCachedStopPayload<StopResponseContract>(key);
      if (cached) return cached;

      const hub = HUB_CONFIGS[key];
      try {
        if (!apiKey || apiKey === 'INVALID_KEY' || apiKey === 'YOUR_SERPAPI_KEY') {
          const fallback = {
            ...hub.fallbackFixture,
            _meta: { cached: false, ttlSeconds: 600, source: 'static-fallback' },
          };
          setCachedStopPayload(key, fallback, 600);
          return fallback;
        }

        const serpResults = await fetchSerpApiSignalsForHub(hub, apiKey);

        if (!serpResults.mapsData && !serpResults.reviewsData && !serpResults.trendsData && !serpResults.newsData) {
          const fallback = {
            ...hub.fallbackFixture,
            _meta: { cached: false, ttlSeconds: 600, source: 'static-fallback' },
          };
          setCachedStopPayload(key, fallback, 600);
          return fallback;
        }

        const payload = transformSerpToSignals(hub, serpResults);
        const live = {
          ...payload,
          _meta: { cached: false, ttlSeconds: 600, source: 'serpapi_live' },
        };
        setCachedStopPayload(key, live, 600);
        return live;
      } catch {
        console.warn(`[DEMO MODE] SerpApi failed for ${key}, serving static fallback`);
        const fallback = {
          ...hub.fallbackFixture,
          _meta: { cached: false, ttlSeconds: 600, source: 'static-fallback' },
        };
        return fallback;
      }
    })
  );

  res.status(200).json(results);
});

/**
 * POST /api/cache/clear
 * Clears backend cache for testing
 */
stopsRouter.post('/cache/clear', (req: Request, res: Response): void => {
  clearStopCache();
  res.json({ success: true, message: 'Node-cache cleared successfully' });
});
