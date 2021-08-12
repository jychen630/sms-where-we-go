import { Operation } from "express-openapi";
import { pg } from "..";
import {
    Actions,
    dbHandleError,
    parseBody,
    sendError,
    sendSuccess,
    ServerLogger,
} from "../utils";
import { StudentClass } from "../generated/schema";
import { StudentService } from "../services";
import { Service } from "../generated";

export const get: Operation = (req, res) => {
    const logger = ServerLogger.getLogger("getDevLogin");

    if (process.env.NODE_ENV !== "development") {
        res.status(404).send();
        return;
    }
    pg<StudentClass>("wwg.student_class")
        .column("student_uid", "name", "grad_year", "class_number", "role")
        .select()
        .orderBy("student_uid")
        .then((result) => {
            sendSuccess(res, {
                users: result.map((value) => ({
                    uid: value.student_uid,
                    name: value.name,
                    class_number: value.class_number,
                    grad_year: value.grad_year,
                    role: value.role,
                })),
            });
            logger.logComposed(
                req.session.student_uid ?? "Developer",
                Actions.access,
                "available users"
            );
        })
        .catch((err) => dbHandleError(err, res, logger.logger));
};

export const post: Operation = async (req, res) => {
    const data = parseBody<typeof Service.postDevLogin>(req);
    const logger = ServerLogger.getLogger("postDevLogin");

    if (process.env.NODE_ENV !== "development") {
        res.status(404).send();
        return;
    }

    const student = await StudentService.get(data.uid);
    if (student === undefined || student.student_uid === null) {
        logger.logComposed(
            req.session.student_uid ?? "Developer",
            Actions.access,
            `dev-login ${data.uid}`,
            false,
            "the student doesn't exist",
            true
        );
        sendError(res, 200, "The student doesn't exists");
    } else {
        logger.logComposed(
            req.session.student_uid ?? "Developer",
            Actions.access,
            `dev-login ${data.uid}`
        );
        req.session.identifier = data.uid;
        req.session.student_uid = student.student_uid;
        sendSuccess(res, {
            role: student.role,
        });
    }
};
