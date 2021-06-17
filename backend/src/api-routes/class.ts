import { Operation } from "express-openapi";
import { Service } from "../generated";
import log4js from "log4js";
import { parseBody, sendError, sendSuccess } from "../utils";
import { pg } from "..";
import { Class } from "../generated/schema";
import { StudentService } from "../services";

export const get: Operation = async (req, res) => {
    const logger = log4js.getLogger("class.get");

    if (!!!req.session.identifier || req.session.student_uid === undefined) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to access the registration keys');
        return;
    }

    const student = await StudentService.get(req.session.student_uid);

    if (student === undefined) {
        logger.info(`The user is invalid (uid: ${req.session.student_uid})`);
        sendError(res, 403, 'The user is invalid for this operation');
        return;
    }

    pg("wwg.class")
        .select()
        .modify<(Class)[], (Class)[]>((qb) => {
            if (student.level as number < 16) {
                qb.where('class.grad_year', student.grad_year);
            }

            if (student.level as number < 8) {
                qb.where('class.curriculum_name', student.curriculum_name);
            }

            if (student.level as number < 4) {
                qb.where('class.class_number', student.class_number as number);
            }
        })
        .then((result) => {
            sendSuccess(res, {
                classes: result
            });
        })
}

export const post: Operation = (req, res) => {
    const data = parseBody<typeof Service.postClass>(req);
}

export const DELETE: Operation = (req, res) => {
    const data = parseBody<typeof Service.deleteClass>(req);
}