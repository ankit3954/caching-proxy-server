import axios, { type Method } from "axios";
import { filterHeaders } from "./handler.js";

interface RequestDetails {
    method: string;
    path: string;
    headers: any;
    body: any
}

export const forwardToOrigin = async (requestDetails: RequestDetails, origin: string) => {
    try {
        const { path, method, headers, body } = requestDetails;
        const originUrl = `${origin}${path}`

        const response = await axios({
            url: originUrl,
            method: method as Method,
            headers: filterHeaders(headers), // Prevents server hanging bugs
            data: body,
        });

        return response;
    } catch (error) {
        console.log(error)
    }
}