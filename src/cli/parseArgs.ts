import { Command } from "commander";

export const parseArgument = (args: string[]) => {
    const program = new Command();
    console.log(args)
    program
        .version("1.0.0")
        .description("This is proxy caching server")
        .option("-p , --port <value>", "Caching proxy server port")
        .option("-o ,  --origin <value>", "Origin Server URL")
        .parse(args);

    const options = program.opts();
    console.log(options)
    const {port, origin} = options;

    return {
        port,
        origin
    }
}




