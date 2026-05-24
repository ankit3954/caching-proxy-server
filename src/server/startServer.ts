import express from "express";

export const startServer = (PORT: Number, origin: string) => {
    try {
        const app = express();

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.log(error)
    }

}


