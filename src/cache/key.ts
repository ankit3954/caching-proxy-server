const sortQueryParams = (queryString: string) => {
    const params = new URLSearchParams(queryString);

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
        return `${method}:${path}`;
    }

    const sortedQueryString = sortQueryParams(queryString)

    const sortedURL = sortedQueryString ? `${path}:${sortedQueryString}`
        : path;

    return `${method}:${sortedURL}`;
}

