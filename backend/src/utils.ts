import { Response, Request } from "express";

export const sendSuccess = (res: Response, result?: object) => {
    res.status(200).json({
        result: "success",
        message: "",
        ...result
    })
};

export const sendError = (res: Response, code: number, message?: string) => {
    res.status(code ?? 200).json({
        result: "error",
        message: message ?? "An unspecified error has occurred from the serverside."
    })
};

export const parseBody = <T extends (requestBody: any) => any>(req: Request): Parameters<T>[0] => {
    // This function takes the type of an OpenAPI service function that has a request body 
    // and extract the request body and return it given the type definition of the request body.
    // Note: This does not validate whether the request body contains the required parameters.
    return req.body as any;
}
