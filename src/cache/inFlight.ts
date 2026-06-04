const inFlightMap = new Map<string, Promise<any>>();

export const getOrCreateInFlight = async <T>(
    key: string,
    executor: () => Promise<T>
): Promise<T> => {

    const existing = inFlightMap.get(key);
    if (existing) return existing;

    const promise = (async () => {
        try {
            return await executor();
        } finally {
            inFlightMap.delete(key);
        }
    })();

    inFlightMap.set(key, promise);
    console.log("INFLIGHT-------", inFlightMap)
    return promise;
};