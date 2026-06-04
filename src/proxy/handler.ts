import express, { type Request, type Response } from "express";
import axios, { type Method } from "axios";
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
    "host"
])

const CACHE_METHODS = ["GET", "HEAD"];

export const filterHeaders = (headers: any): Record<string, any> => {
    const filtered: Record<string, any> = {};

    for (const key in headers) {
        if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            filtered[key] = headers[key];
        }
    }

    return filtered;
};


export const handleAllRequests = async (req: Request, res: Response, origin: string) => {
    try {
        const requestDetails = {
            method: req.method,
            path: req.originalUrl,
            headers: req.headers,
            body: req.body
        }

        const isCacheable = CACHE_METHODS.includes(requestDetails.method);

        const cacheKey = isCacheable
            ? keyGenerator(requestDetails.method, requestDetails.path)
            : null;

        if (isCacheable && cacheKey) {
            const cachedResponse = getCacheResponse(cacheKey);
        
            if (cachedResponse) {

                const { status, headers, data } = cachedResponse;
                const responseHeaders = {
                    ...headers,
                    "x-cache": "HIT"
                };
                const contentType = String(headers["content-type"] || "");

                res.status(status);
                res.set(responseHeaders);

                if (contentType.includes("application/json")) {
                    return res.json(data);
                }

                return res.send(data);
            }
        }

        const response = await getOrCreateInFlight(
            cacheKey || `${requestDetails.method}:${requestDetails.path}`,
            async () => {
                const originResponse = await forwardToOrigin(
                    requestDetails,
                    origin
                );

                if (!originResponse) return null;

                const { status, data, headers } = originResponse;

                const cleanedHeaders = filterHeaders(headers);

                if (
                    isCacheable &&
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
            }
        );

        if (!response) {
            return res.status(502).send("No response received from origin");
        }

        const { headers, data, status } = response;
        const responseHeaders = {
            ...headers,
            "x-cache": "MISS"
        };
        const contentType = String(headers["content-type"] || "");

        res.status(status);
        res.set(responseHeaders);

        if (contentType.includes("application/json")) {
            return res.json(data);
        } 

        return res.send(data);
        
    } catch (error) {
        console.error("Proxy error:", error);
        return res.status(502).send("Bad Gateway");
    }
}