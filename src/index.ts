#! /usr/bin/env node

import { parseArgument } from "./cli/parseArgs.js";
import { startServer } from "./server/proxyServer.js";

try {
    const {port, origin} = parseArgument(process.argv);
    startServer(port, origin);
    
} catch (error) {
    console.error("App has an error", error)
}