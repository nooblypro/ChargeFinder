import { getJson } from 'serpapi';
import { HubConfig } from '../data/hubConfigs.js';
import { SerpRawResults } from '../transformers/signalTransformer.js';

async function safeFetchSerp(engine: string, queryParams: Record<string, any>, apiKey?: string): Promise<any> {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_SERPAPI_KEY') {
    return null;
  }

  try {
    const data = await getJson({
      engine,
      api_key: apiKey,
      ...queryParams,
    });
    if (data && !data.error) {
      return data;
    }
    return null;
  } catch (err: any) {
    console.warn(`[SerpApi Engine Error] '${engine}' call failed:`, err?.error || err);
    return null;
  }
}

export async function fetchPlaceReviews(dataId: string, apiKey?: string): Promise<any> {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_SERPAPI_KEY') {
    return null;
  }
  return safeFetchSerp('google_maps_reviews', { data_id: dataId, sort_by: 'newestFirst' }, apiKey);
}

/**
 * Executes 4 concurrent SerpApi calls for Maps, Reviews, Trends, and News
 */
export async function fetchSerpApiSignalsForHub(hub: HubConfig, apiKey?: string): Promise<SerpRawResults> {
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_SERPAPI_KEY') {
    // Return empty results object to trigger deterministic benchmark fallback
    return {};
  }

  const { mapsQuery, reviewsQuery, trendsQuery, newsQuery } = hub.serpParams;
  const ll = `@${hub.coordinates.lat},${hub.coordinates.lng},14z`;

  try {
    const [mapsData, reviewsData, trendsData, newsData] = await Promise.all([
      // 1. Google Maps Call
      safeFetchSerp('google_maps', { q: mapsQuery, ll }, apiKey),

      // 2. Google Maps Reviews Call
      safeFetchSerp('google_maps_reviews', { q: reviewsQuery, ll }, apiKey),

      // 3. Google Trends Call
      safeFetchSerp('google_trends', { q: trendsQuery, geo: 'IN' }, apiKey),

      // 4. Google News Call
      safeFetchSerp('google_news', { q: newsQuery, location: 'India' }, apiKey),
    ]);

    return { mapsData, reviewsData, trendsData, newsData };
  } catch (err) {
    console.warn(`[SerpApi Error] Execution failed for hub ${hub.id}:`, err);
    return {};
  }
}
