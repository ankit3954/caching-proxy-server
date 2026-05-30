import express, { type Request, type Response } from "express";
import { handleAllRequests } from "./handler.js";


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


