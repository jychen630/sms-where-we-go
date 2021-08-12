import { Response, Request } from "express";
import { getLogger, Logger } from "log4js";
import { Result } from "./generated";
import { StudentClassRole } from "./generated/schema";
import { StudentService } from "./services";

export const sendSuccess = (res: Response, result?: object) => {
    res.status(200).json({
        result: "success",
        message: "",
        ...result,
    });
};

export const sendError = (res: Response, code: number, message?: string) => {
    res.status(code ?? 200).json({
        result: "error",
        message:
            message ?? "An unspecified error has occurred from the serverside.",
    });
};

export const parseQuery = <T extends (parameters: any) => any>(
    req: Request
): Parameters<T> => {
    // This function takes the type of an OpenAPI service function that has a request body
    // and extract the request body and return it given the type definition of the request body.
    // Note: This does not validate whether the request body contains the required parameters.
    return req.query as any;
};

export const parseBody = <T extends (requestBody: any) => any>(
    req: Request
): Parameters<T>[0] => {
    // This function takes the type of an OpenAPI service function that has a request body
    // and extract the request body and return it given the type definition of the request body.
    // Note: This does not validate whether the request body contains the required parameters.
    return req.body as any;
};

/*
Remove the keys with null values from an object
*/
export const removeNull = (obj: any) => {
    Object.entries(obj).forEach(
        ([key, value]) => value === null && delete obj[key]
    );
    return obj;
};

export const removeKeys = (
    obj: Record<any, any>,
    keys: Set<string>,
    privilege?: { update: boolean }
) => {
    if (privilege?.update) {
        // If the user is able to update this student, we assume that the hidden fields don't apply
        return obj;
    }

    Object.keys(obj).forEach((key) => keys.has(key) && delete obj[key]);

    return obj;
};

export const parseHiddenFields = (original: string | null) => {
    let hiddenFields: Set<string>;
    if (typeof original === "string") {
        hiddenFields = new Set(original.slice(1, -1).split(","));
        if (hiddenFields.has("school_uid")) {
            hiddenFields.add("school_name");
        }
    } else {
        hiddenFields = new Set();
    }
    return hiddenFields;
};

export const dbHandleError = (err: any, res: Response, logger: Logger) => {
    if (!!!err.detail) {
        logger.error(err);
        sendError(res, 500, "An unknown error occurred");
        return;
    }

    const pattern = /\((.*)\)=\((.*)\)/;
    const matchGroup = err.detail.match(pattern);
    switch (err.code) {
        case "23505":
            logger.error(err.detail);
            sendError(
                res,
                200,
                `The ${matchGroup[1]} '${matchGroup[2]}' has already been taken`
            );
            break;
        case "23503":
            logger.error(err.detail);
            if (err.detail !== undefined) {
                if (err.detail.includes("is still reference")) {
                    sendError(
                        res,
                        200,
                        `${matchGroup[2]} (${matchGroup[1]}) cannot be deleted`
                    );
                } else {
                    sendError(
                        res,
                        200,
                        `${matchGroup[2]} does not exist as ${matchGroup[1]}`
                    );
                }
            } else {
                sendError(
                    res,
                    200,
                    `${matchGroup[2]} is invalid for ${matchGroup[1]}`
                );
            }
            break;
        default:
            logger.error(err);
            sendError(
                res,
                200,
                `An unknown error just occured [code ${err.code ?? -1}]`
            );
    }
};

export const compareStudents = (
    current: StudentClassRole,
    target: StudentClassRole
) => {
    const isSameYear = current.grad_year === target.grad_year;
    return {
        isSameStudent: current.student_uid === target.student_uid,
        isSameYear: isSameYear,
        isSameCurriculum:
            isSameYear && current.curriculum_name === target.curriculum_name,
        isSameClass: isSameYear && current.class_number === target.class_number,
        // Only students in the same year with higher privilege level are adminable over another student
        isAdminable:
            isSameYear && (current.level as number) > (target.level as number),
    };
};

export const validateLogin = (
    req: Request,
    res: Response,
    logger: ServerLogger,
    message?: string
): boolean => {
    if (!!!req.session.identifier || req.session.student_uid === undefined) {
        logger.logComposed(
            "Visitor",
            Actions.access,
            "this operation",
            false,
            "the user did not log in",
            true
        );
        sendError(res, 401, message ?? "Please login to access this operation");
        return false;
    } else {
        return true;
    }
};

export const validateAdmin = async (
    res: Response,
    self: StudentClassRole,
    logger: ServerLogger,
    minLevel: number = 1
): Promise<boolean> => {
    if (typeof self.level !== "number" || self.level < minLevel) {
        logger.logComposed(
            self,
            Actions.access,
            "this operation",
            true,
            "the user does not have enough privilege",
            true
        );
        sendError(res, 403, "You are not allowed for this operation");
        return false;
    } else {
        return true;
    }
};

export const getSelf = async (
    req: Request,
    res: Response,
    logger: ServerLogger,
    validator?: (self: StudentClassRole) => boolean
): Promise<StudentClassRole> => {
    const student = await StudentService.get(req.session.student_uid);

    if (student === undefined || (validator && !validator(student))) {
        logger.logComposed(
            req.session.student_uid,
            Actions.read,
            "self",
            false,
            "the student was invalid"
        );
        sendError(res, 403, "Invalid user for this operation");
        return Promise.reject();
    } else {
        return Promise.resolve(student);
    }
};

export class Actions {
    static create = (p: boolean) => (p ? "create" : "created");
    static access = (p: boolean) => (p ? "access" : "accessed");
    static update = (p: boolean) => (p ? "update" : "updated");
    static delete = (p: boolean) => (p ? "delete" : "deleted");
    static read = (p: boolean) => (p ? "read" : "read");
}
export class ServerLogger {
    logger: Logger;
    constructor(logger: Logger) {
        this.logger = logger;
    }
    static getLogger(name: string) {
        return new ServerLogger(getLogger(name));
    }
    /**
     * Efficiently generate concise, standardlized log messages
     *
     * @param who The information associated with requester
     * @param action The action that was taken
     * @param target The target of the action
     * @param showPrivilege Whether to show the privilege information of the requester and the target (if there is any)
     * @param exception Details about how the action has failed
     * @param error Whether display the log message as an error or not
     * @param additional Additional information as an object that will be converted to JSON to be displayed
     */
    logComposed(
        who: StudentClassRole | number | string,
        action: (p: boolean) => string,
        target?: string | StudentClassRole,
        showPrivilege: boolean = false,
        exception?: string,
        error: boolean = false,
        additional?: object
    ): void {
        const formatPrivilege = (student: StudentClassRole) =>
            showPrivilege
                ? `, role: ${student.role}, level: ${student.level}`
                : "";
        const hasException = exception !== undefined;
        if (who === undefined) who = "Unknown user";
        const student =
            typeof who === "number"
                ? `uid ${who}`
                : typeof who === "string"
                ? who
                : `${who.name} (uid: ${who.student_uid}${formatPrivilege(
                      who
                  )})`;
        let message = `${student}${
            hasException ? " attemped to " : " "
        }${action(hasException)}${
            !!target
                ? ` ${
                      typeof target === "string"
                          ? target
                          : formatPrivilege(target)
                  }`
                : ""
        }`;
        if (hasException) {
            message = message.concat(` but ${exception}`);
        }
        if (!!additional) {
            message = message.concat(
                `\naddtional info:\n${JSON.stringify(
                    additional
                )}\n==== end ====`
            );
        }

        if (error) {
            this.logger.error(message);
        } else {
            this.logger.info(message);
        }
    }
}
