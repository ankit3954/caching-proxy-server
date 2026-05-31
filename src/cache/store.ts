export interface CacheEntry {
    status: number;
    headers: Record<string, any>;
    body: any;
    createdAt: number;
}

const TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, CacheEntry>();

export const getCacheResponse = (key: string) : CacheEntry | null => {
    const entry = cache.get(key);

    if (!entry) {
        return null;
    }

    const isExpired = Date.now() - entry.createdAt > TTL;

    if (isExpired) {
        cache.delete(key);
        return null;
    }

    return entry;
}

const storeCacheResponse = () => {

}