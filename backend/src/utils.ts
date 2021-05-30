import { Response, Request } from "express";
import { Logger } from "log4js";
import { StudentClassRole } from "./generated/schema";

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

export const parseQuery = <T extends (parameters: any) => any>(req: Request): Parameters<T> => {
    // This function takes the type of an OpenAPI service function that has a request body 
    // and extract the request body and return it given the type definition of the request body.
    // Note: This does not validate whether the request body contains the required parameters.
    return req.query as any;
}

export const parseBody = <T extends (requestBody: any) => any>(req: Request): Parameters<T>[0] => {
    // This function takes the type of an OpenAPI service function that has a request body 
    // and extract the request body and return it given the type definition of the request body.
    // Note: This does not validate whether the request body contains the required parameters.
    return req.body as any;
}

/*
Remove the keys with null values from an object
*/
export const removeNull = (obj: any) => {
    Object.entries(obj).forEach(([key, value]) => (value === null) && delete obj[key]);
    return obj;
}

export const dbHandleError = (err: any, res: Response, logger: Logger) => {
    if (!!!err.detail) {
        logger.error(err);
        sendError(res, 500, 'An unknown error occurred');
        return;
    }

    const pattern = /\((.*)\)=\((.*)\)/;
    const matchGroup = err.detail.match(pattern);
    switch (err.code) {
        case '23505':
            logger.error(err.detail);
            sendError(res, 200, `The ${matchGroup[1]} '${matchGroup[2]}' has already been taken`);
            break;
        case '23503':
            logger.error(err.detail);
            sendError(res, 200, `${matchGroup[2]} is not a existing ${matchGroup[1]}`);
            break;
        default:
            logger.error(err);
            sendError(res, 200, `An unknown error just occured [code ${err.code ?? -1}]`);
    }
}

export const compareStudents = (current: StudentClassRole, target: StudentClassRole) => {
    const isSameYear = current.grad_year === target.grad_year
    return {
        isSameStudent: current.student_uid === target.student_uid,
        isSameYear: isSameYear,
        isSameCurriculum: isSameYear && current.curriculum_name === target.curriculum_name,
        isSameClass: isSameYear && current.class_number === target.class_number,
        // Only students in the same year with higher privilege level are adminable over another student
        isAdminable: isSameYear && ((current.level as number) > (target.level as number)),
    }
}
