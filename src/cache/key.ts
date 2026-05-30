const sortQueryParams = (queryString: string) => {
    const params = new URLSearchParams(queryString);

    // Convert to array, sort manually (deterministic)
    const sortedParams = Array.from(params.entries()).sort(([aKey], [bKey]) =>
        aKey.localeCompare(bKey)
    );

    const sortedQueryString = sortedParams
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return sortedQueryString;
}

export const keyGenerator = (method: string, fullUrl: string) => {
    const [path, queryString] = fullUrl.split('?');

    if (!queryString) {
        console.log("Sorted URL", `${method}:${path}`)
        return `${method}:${path}`;
    }

    const sortedQueryString = sortQueryParams(queryString)

    const sortedURL = sortedQueryString ? `${path}:${sortedQueryString}`
        : path;
    console.log("Sorted URL", `${method}:${sortedURL}`)

    return `${method}:${sortedURL}`;
}

