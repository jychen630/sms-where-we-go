import { Operation } from "express-openapi";
import { Service } from "../generated";
import log4js from "log4js";
import { dbHandleError, parseBody, sendError, sendSuccess } from "../utils";
import { pg } from "..";
import { Class } from "../generated/schema";
import { ClassService, RoleResource, RoleService, StudentService } from "../services";

export const get: Operation = async (req, res) => {
    const logger = log4js.getLogger("class.get");

    if (!!!req.session.identifier || req.session.student_uid === undefined) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to access the classes');
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

export const post: Operation = async (req, res) => {
    const data = parseBody<typeof Service.postClass>(req);
    const logger = log4js.getLogger("school.post");

    if (!!!req.session.identifier || req.session.student_uid === undefined) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to access the classes');
        return;
    }

    const student = await StudentService.get(req.session.student_uid);
    const classResource = new RoleResource({
        classNumber: data.class_number,
        gradYear: data.grad_year,
        curriculum: data.curriculum,
    });

    const privilege = await RoleService.privilege(RoleService.studentToRoleResource(student), classResource);
    if (privilege.update) {
        pg('wwg.class')
            .insert({
                class_number: data.class_number,
                grad_year: data.grad_year,
                curriculum_name: data.curriculum,
            })
            .then(() => sendSuccess(res))
            .catch((err) => dbHandleError(err, res, logger));
    }
    else {
        logger.info(`${student?.student_uid} attempted to add class ${data.class_number} ${data.grad_year} ${data.curriculum}`)
        sendError(res, 403, "You're not allowed to add this class");
    }
}

export const DELETE: Operation = async (req, res) => {
    const data = parseBody<typeof Service.deleteClass>(req);
    const logger = log4js.getLogger('student.delete');

    if (!!!req.session.student_uid) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to delete the class');
        return;
    }

    const student = await StudentService.get(req.session.student_uid);
    const class_ = await ClassService.get(data.grad_year, data.class_number);
    if (class_ === undefined) {
        logger.error(`${req.session.student_uid} attempts to delete ${data.class_number} ${data.grad_year} that does not exist`)
        sendError(res, 400, "You are not authorized to delete this class");
        return;
    }

    const classResource = new RoleResource({
        classNumber: class_.class_number as number,
        gradYear: class_.grad_year,
        curriculum: class_.curriculum_name,
    });
    const privilege = await RoleService.privilege(RoleService.studentToRoleResource(student), classResource);

    if (!privilege.delete) {
        logger.error(`${req.session.student_uid} is denied from deleting class ${data.class_number} ${data.grad_year}`);
        sendError(res, 403, 'You are not authorized to delete this class');
        return;
    }

    pg('wwg.class')
        .delete()
        .where({
            class_number: data.class_number,
            grad_year: data.grad_year
        })
        .then((result) => {
            if (result === 0) {
                logger.info(`${req.session.student_uid} failed to delete class ${data.class_number} ${data.grad_year}`);
                sendSuccess(res, { message: 'No class affected' });
            }
            else {
                logger.info(`Class ${data.class_number} ${data.grad_year} is deleted by ${req.session.student_uid}`);
                sendSuccess(res, { message: 'Successfully deleted the class' });
            }
        })
        .catch((err) => dbHandleError(err, res, logger));
}