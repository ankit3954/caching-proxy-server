import express, { type Request, type Response } from "express";
import axios, { type Method } from "axios";

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


interface RequestDetails {
    method: string;
    path: string;
    headers: any;
    body: any
}


const filterHeaders = (headers: any) => {
    const filtered: Record<string, any> = {};

    for(const key in headers){
        if(!HOP_BY_HOP_HEADERS.has(key.toLowerCase())){
            filtered[key] = headers[key];
        }
    }
};

const handleAllRequests = async (req: Request, res: Response, origin: string) => {

    const requestDetails = {
        method: req.method,
        path: req.originalUrl,
        headers: req.headers,
        body: req.body
    }

    const response = await forwardToOrigin(requestDetails, origin);

    if (!response)
        return res.json("No response received");

    const { headers, data, status } = response;

    const filteredHeaders = filterHeaders(headers);

    const contentType = String(headers["content-type"] || "");

    res.status(status);
    res.set(filteredHeaders);

    if (contentType.includes("application/json")) {
        res.json(data);
    } else {
        res.send(data);
    }

}


const forwardToOrigin = async (requestDetails: RequestDetails, origin: string) => {
    try {
        const { path, method, headers, body } = requestDetails;
        const originUrl = `${origin}${path}`
        console.log(originUrl)

        const response = await axios({
            url: originUrl,
            method: method as Method,
            headers: headers, // Prevents server hanging bugs
            data: body,
        });

        return response;
    } catch (error) {
        console.log(error)
    }
}


export const startServer = (PORT: number, origin: string) => {
    try {
        const app = express();
        app.use(express.json());

        app.use((req: Request, res: Response) => {
            handleAllRequests(req, res, origin);
        })

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error)
    }

}


