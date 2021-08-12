import argparse from "argparse";
import log4js from "log4js";

export function getLoggerWithExistingParser(parser, loggerName, path) {
    // ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, MARK, OFF
    let level = "warn";
    parser.add_argument("-f", "--force", {
        action: "store_true",
        help: "Reset the database before loading the data",
    });
    let group = parser.add_mutually_exclusive_group();
    group.add_argument("-v", "--verbose", {
        action: "store_true",
        help: "Show verbose console output",
    });
    group.add_argument("-s", "--silent", {
        action: "store_true",
        help: "Do not show any output",
    });

    const args = parser.parse_args();

    let logger = log4js
        .configure({
            appenders: {
                console: { type: "console" },
                file: {
                    type: "file",
                    filename: path,
                },
            },
            categories: {
                default: {
                    appenders: args.silent ? ["file"] : ["console", "file"],
                    level: args.verbose ? "all" : "info",
                },
            },
        })
        .getLogger(loggerName);

    return logger;
}

export function getLoggerWithArgs(loggerName, path) {
    const parser = new argparse.ArgumentParser({
        description: "Load or incrementally add initial data to the database",
    });

    return addLogArguments(parser, loggerName, path);
}
