import { Command } from "commander";

export const parseArgument = (args: string[]) => {
    const program = new Command();
    program
        .version("1.0.0")
        .description("This is proxy caching server")
        .option("-p , --port <value>", "Caching proxy server port")
        .option("-o ,  --origin <value>", "Origin Server URL")
        .option("-t , --ttl <value>", "Time To Live in mins")
        .parse(args);

    const options = program.opts();
    const {port, origin, ttl} = options;

    return {
        port,
        origin,
        ttl
    }
}




