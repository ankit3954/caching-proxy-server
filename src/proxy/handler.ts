import express, { type Request, type Response } from "express";
import axios, { type Method } from "axios";
import { forwardToOrigin } from "./forward.js";
import { keyGenerator } from "../cache/key.js";
import { getCacheResponse, storeCacheResponse } from "../cache/store.js";

const HOP_BY_HOP_HEADERS = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "content-length"
])

const CACHE_METHODS = ["GET", "HEAD"];

const filterHeaders = (headers: any): Record<string, any> => {
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

        if (CACHE_METHODS.includes(requestDetails.method)) {
            const cacheKey = keyGenerator(requestDetails.method, requestDetails.path);

            const cachedResponse = getCacheResponse(cacheKey);
            //logic to forward cached response if found
            if (cachedResponse) {
                const { status, headers, data } = cachedResponse;
                headers["x-cache"] = "HIT";
                res.status(status);
                res.set(headers);
                const contentType = String(headers["content-type"] || "");
                if (contentType.includes("application/json")) {
                    return res.json(data);
                } else {
                    return res.send(data);
                }
            }
        }


        const response = await forwardToOrigin(requestDetails, origin);

        if (!response)
            return res.status(502).send("No response received from origin");

        const { headers, data, status } = response;

        const filteredHeaders = filterHeaders(headers);

        const contentType = String(headers["content-type"] || "");

        if (CACHE_METHODS.includes(requestDetails.method)) {
            const cacheKey = keyGenerator(requestDetails.method, requestDetails.path);
            storeCacheResponse(cacheKey, status, filteredHeaders, data)
            filteredHeaders["x-cache"] = "MISS";
        }

        res.status(status);
        res.set(filteredHeaders);


        if (contentType.includes("application/json")) {
            res.json(data);
        } else {
            res.send(data);
        }
    } catch (error) {
        console.error("Proxy error:", error);

        return res.status(502).send("Bad Gateway");
    }


}