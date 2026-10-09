import NodeCache from 'node-cache';

// 10-minute default TTL (600 seconds) for API responses as mandated by ChargeSync specs
export const apiCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false,
});

export function getCachedStopPayload<T>(stopId: string): T | undefined {
  return apiCache.get<T>(`stop_${stopId}`);
}

export function setCachedStopPayload<T>(stopId: string, payload: T, ttlSeconds: number = 600): boolean {
  return apiCache.set(`stop_${stopId}`, payload, ttlSeconds);
}

export function clearStopCache(stopId?: string): void {
  if (stopId) {
    apiCache.del(`stop_${stopId}`);
  } else {
    apiCache.flushAll();
  }
}
