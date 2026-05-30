import axios, { type Method } from "axios";

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
        // console.log(originUrl)

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