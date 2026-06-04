export interface CacheEntry {
    status: number;
    headers: Record<string, any>;
    data: any;
    createdAt: number;
}

const TTL = 5 * 60 * 1000; // 5 minutes

const cache = new Map<string, CacheEntry>();

export const getCacheResponse = (key: string): CacheEntry | null => {
    // console.log(cache)
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

export const storeCacheResponse = (
    key: string,
    status: number,
    headers: Record<string, any>,
    data: any
): void => {
    try {
     cache.set(key, {
        status,
        headers,
        data,
        createdAt: Date.now()
    });
    } catch (error) {
        console.error(error)
    }
   
}