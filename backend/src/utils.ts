import { Response } from "express";

export const sendSuccess = (res: Response, message?: string) => {
    res.status(200).json({
        result: "success",
        message: message ?? ""
    })
};

export const sendError = (res: Response, code: number, message?: string) => {
    console.error(message);
    res.status(code ?? 200).json({
        result: "error",
        message: message ?? "An unspecified error has occurred from the serverside."
    })
};
