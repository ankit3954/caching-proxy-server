import { type Request, type Response } from "express";
import { forwardToOrigin } from "./forward.js";
import { keyGenerator } from "../cache/key.js";
import { getCacheResponse, storeCacheResponse } from "../cache/store.js";
import { getOrCreateInFlight } from "../cache/inFlight.js";

const HOP_BY_HOP_HEADERS = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-length",
    "host",
]);

export const filterHeaders = (headers: any): Record<string, any> => {
    const filtered: Record<string, any> = {};

    for (const key in headers) {
        if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            filtered[key] = headers[key];
        }
    }

    return filtered;
};

const CACHEABLE_METHODS = ["GET", "HEAD"];
const INFLIGHT_METHODS = ["GET", "HEAD"];

export const buildRequestContext = (req: Request) => {
    const method = req.method;
    const path = req.originalUrl;

    return {
        method,
        path,
        headers: req.headers,
        body: req.body,
        isCacheable: CACHEABLE_METHODS.includes(method),
        isSafeToCollapse: INFLIGHT_METHODS.includes(method),
    };
};

export const tryCache = (ctx: any) => {
    if (!ctx.isCacheable) return null;

    const cacheKey = keyGenerator(ctx.method, ctx.path);
    const cached = getCacheResponse(cacheKey);

    if (!cached) return null;

    return {
        cacheKey,
        response: cached,
    };
};

export const executeRequest = async (ctx: any, origin: string) => {
    const cacheKey = ctx.isCacheable
        ? keyGenerator(ctx.method, ctx.path)
        : null;

    const key = cacheKey || `${ctx.method}:${ctx.path}`;

    return getOrCreateInFlight(key, async () => {
        const originResponse = await forwardToOrigin(ctx, origin);

        if (!originResponse) return null;

        const { status, data, headers } = originResponse;

        const cleanedHeaders = filterHeaders(headers);

        if (
            ctx.isCacheable &&
            cacheKey &&
            status >= 200 &&
            status < 300
        ) {
            storeCacheResponse(
                cacheKey,
                status,
                cleanedHeaders,
                data
            );
        }

        return {
            status,
            headers: cleanedHeaders,
            data,
        };
    });
};


export const sendResponse = (res: Response, response: any, cacheStatus: "HIT" | "MISS") => {
    if (!response) {
        return res.status(502).send("No response from origin");
    }

    const { status, headers, data } = response;

    res.status(status);
    res.set({
        ...headers,
        "x-cache": cacheStatus,
    });

    const contentType = String(headers["content-type"] || "");

    if (contentType.includes("application/json")) {
        return res.json(data);
    }

    return res.send(data);
};


export const handleAllRequests = async (
    req: Request,
    res: Response,
    origin: string
) => {
    try {
        const ctx = buildRequestContext(req);

        const cacheKey = ctx.isCacheable
            ? keyGenerator(ctx.method, ctx.path)
            : null;

        if (ctx.isCacheable && cacheKey) {
            const cached = getCacheResponse(cacheKey);

            if (cached) {
                return sendResponse(res, cached, "HIT");
            }
        }

        let response;

        if (ctx.isSafeToCollapse) {
            response = await executeRequest(ctx, origin);
        } else {
            const originResponse = await forwardToOrigin(ctx, origin);

            if (!originResponse) {
                return res.status(502).send("No response from origin");
            }

            const { status, data, headers } = originResponse;

            response = {
                status,
                data,
                headers: filterHeaders(headers),
            };
        }

        return sendResponse(res, response, "MISS");
    } catch (error) {
        console.error("Proxy error:", error);
        return res.status(502).send("Bad Gateway");
    }
};





// export const handleAllRequests = async (
//     req: Request,
//     res: Response,
//     origin: string,
// ) => {
//     try {
//         const requestDetails = {
//             method: req.method,
//             path: req.originalUrl,
//             headers: req.headers,
//             body: req.body,
//         };

//         const isCacheable = CACHEABLE_METHODS.includes(requestDetails.method);
//         const isSafeToCollapse = INFLIGHT_METHODS.includes(requestDetails.method);

//         const cacheKey = isCacheable
//             ? keyGenerator(requestDetails.method, requestDetails.path)
//             : null;

//         if (isCacheable && cacheKey) {
//             const cachedResponse = getCacheResponse(cacheKey);

//             if (cachedResponse) {
//                 const { status, headers, data } = cachedResponse;
//                 const responseHeaders = {
//                     ...headers,
//                     "x-cache": "HIT",
//                 };
//                 const contentType = String(headers["content-type"] || "");

//                 res.status(status);
//                 res.set(responseHeaders);

//                 if (contentType.includes("application/json")) {
//                     return res.json(data);
//                 }

//                 return res.send(data);
//             }
//         }

//         let response;
//         if (isSafeToCollapse) {
//             response = await getOrCreateInFlight(
//                 cacheKey || `${requestDetails.method}:${requestDetails.path}`,
//                 async () => {
//                     const originResponse = await forwardToOrigin(requestDetails, origin);

//                     if (!originResponse) return null;

//                     const { status, data, headers } = originResponse;

//                     const cleanedHeaders = filterHeaders(headers);

//                     if (isCacheable && cacheKey && status >= 200 && status < 300) {
//                         storeCacheResponse(cacheKey, status, cleanedHeaders, data);
//                     }

//                     return {
//                         status,
//                         headers: cleanedHeaders,
//                         data,
//                     };
//                 },
//             );
//         } else {
//             //DIRECT CALL (NO CACHE, NO INFLIGHT)
//             const originResponse = await forwardToOrigin(requestDetails, origin);

//             if (!originResponse) {
//                 return res.status(502).send("No response received from origin");
//             }

//             const { status, data, headers } = originResponse;

//             const cleanedHeaders = filterHeaders(headers);

//             response = {
//                 status,
//                 headers: cleanedHeaders,
//                 data,
//             };
//         }

//         if (!response) {
//             return res.status(502).send("No response received from origin");
//         }

//         const { headers, data, status } = response;
//         const responseHeaders = {
//             ...headers,
//             "x-cache": "MISS",
//         };
//         const contentType = String(headers["content-type"] || "");

//         res.status(status);
//         res.set(responseHeaders);

//         if (contentType.includes("application/json")) {
//             return res.json(data);
//         }

//         return res.send(data);
//     } catch (error) {
//         console.error("Proxy error:", error);
//         return res.status(502).send("Bad Gateway");
//     }
// };