import express, { ErrorRequestHandler } from "express";
import { initialize } from "express-openapi";
import dotenv from "dotenv";
import session from "express-session";
import knex from "knex";
import path from "path";
import cors from "cors";
import log4js from "log4js";
import { sendError } from "./utils";
import { pgOptions } from "./pgconfig";

const app = express();
const port = 8080;

export const pg = knex(pgOptions);

dotenv.config();
app.use(
    session({
        secret: process.env.SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1800000,
        },
    })
);

app.use(
    cors({
        credentials: true,
        origin: [
            "http://192.168.0.29:3000",
            "http://localhost:3000",
            "http://localhost:5000",
            "http://47.106.186.142:5000",
        ],
    })
);

log4js.configure({
    appenders: {
        console: { type: "console" },
        file: {
            type: "file",
            filename: `log/server-${new Date()
                .toJSON()
                .split(":")
                .join("-")
                .slice(0, -1)}.log`,
        },
    },
    categories: {
        default: {
            appenders: ["console", "file"],
            level: "info",
        },
        express: {
            appenders: ["console", "file"],
            level: "info",
        },
    },
});
export const logger = log4js.getLogger("express");
const validationPattern = /^(.+)\.openapi\.requestValidation$/;
app.use(log4js.connectLogger(logger, { level: "auto" }));

initialize({
    app,
    apiDoc: "./openapi.yaml",
    paths: path.resolve(__dirname, "api-routes"),
    consumesMiddleware: {
        "application/json": express.json(),
    },
    errorMiddleware: function (err: any, req: any, res: any, next) {
        logger.error(err);

        if (err.type === "entity.parse.failed") {
            sendError(res, err.status, "The content format is invalid");
            return;
        }

        if (!!!err.errors || !(err.errors.length > 0)) {
            sendError(res, err.status, "An unknown error has occurred");
            return;
        }

        let error = err.errors[0];
        let errCode = (error.errorCode as string).match(validationPattern);
        if (errCode) {
            if (
                errCode[1] === "oneOf" &&
                req.path === "/student" &&
                req.method === "POST"
            ) {
                sendError(
                    res,
                    err.status ?? 400,
                    "You should either pass a registration key or class number with graduation year"
                );
                return;
            }

            if (
                errCode[1] === "enum" &&
                error.path === "curriculum" &&
                req.path === "/student" &&
                (req.method === "POST" || req.method === "PUT")
            ) {
                sendError(
                    res,
                    400,
                    '"curriculum" is not allowed for registering or updating'
                );
                return;
            }

            if (errCode[1] === "required") {
                sendError(
                    res,
                    400,
                    error.message.replace("should have", "Missing")
                );
                return;
            }

            if (
                errCode[1] === "enum" &&
                req.path === "/login" &&
                req.method === "POST"
            ) {
                error = err.errors[1];
                errCode = (error.errorCode as string).match(validationPattern);
            }

            if (error.path !== undefined && !!errCode) {
                sendError(
                    res,
                    err.status ?? 400,
                    `[${errCode[1]}] "${error.path}" ${error.message}`
                );
            } else {
                sendError(
                    res,
                    err.status ?? 400,
                    `[${!!errCode ? errCode[1] : "unknown"}] ${error.message}`
                );
            }
        } else {
            sendError(
                res,
                err.status ?? 400,
                error.message ?? "The input information is invalid"
            );
        }
    },
});

app.listen(port, () => {
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV?.trim() === "development") {
        logger.info(
            "This is a development build, run `start-prod` instead if you want to run it in production."
        );
    }
    logger.info(`Start listening at ${port}`);
});

const defaultErrorHandler = ((err, req, res, next) => {
    logger.error(err);
    sendError(res, 500, "Internal server error");
    next(err);
}) as ErrorRequestHandler;
