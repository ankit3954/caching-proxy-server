import express, { type Request, type Response } from "express";
import axios, { type Method } from "axios";

interface RequestDetails {
    method: string;
    path: string;
    headers: any;
    body: any
}

const handleAllRequests = async (req: Request, res: Response, origin: string) => {

    const requestDetails = {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    }

    const response = await forwardToOrigin(requestDetails, origin);
    console.log(response)
    res.json("Hello it returned");

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


