import { Operation } from "express-openapi";
import { Service } from "../generated";
import { Actions, dbHandleError, getSelf, parseBody, sendError, sendSuccess, ServerLogger, validateLogin } from "../utils";
import { pg } from "..";
import { Class } from "../generated/schema";
import { ClassService, RoleResource, RoleService, StudentService } from "../services";

export const get: Operation = async (req, res) => {
    const logger = ServerLogger.getLogger("class.get");

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(self => {
        pg("wwg.class")
            .select()
            .modify<(Class)[], (Class)[]>((qb) => {
                if (self.level as number < 16) {
                    qb.where('class.grad_year', self.grad_year);
                }

                if (self.level as number < 8) {
                    qb.where('class.curriculum_name', self.curriculum_name);
                }

                if (self.level as number < 4) {
                    qb.where('class.class_number', self.class_number as number);
                }
            })
            .orderBy('class.grad_year')
            .orderBy('class.class_number')
            .then((result) => {
                sendSuccess(res, {
                    classes: result.map(val => ({
                        class_number: val.class_number,
                        curriculum: val.curriculum_name,
                        grad_year: val.grad_year
                    }))
                });
            })
            .catch(err => dbHandleError(err, res, logger.logger));
    });
}

export const post: Operation = async (req, res) => {
    const data = parseBody<typeof Service.postClass>(req);
    const logger = ServerLogger.getLogger("school.post");

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(async self => {
        const classResource = new RoleResource({
            classNumber: data.class_number,
            gradYear: data.grad_year,
            curriculum: data.curriculum,
        });

        const privilege = await RoleService.privilege(RoleService.studentToRoleResource(self), classResource);
        if (privilege.update) {
            pg('wwg.class')
                .insert({
                    class_number: data.class_number,
                    grad_year: data.grad_year,
                    curriculum_name: data.curriculum,
                })
                .then(() => {
                    logger.logComposed(
                        self,
                        Actions.create,
                        `${data.class_number} ${data.grad_year} ${data.curriculum}`,
                    )
                    sendSuccess(res);
                })
                .catch((err) => dbHandleError(err, res, logger.logger));
        }
        else {
            logger.logComposed(
                self,
                Actions.create,
                `${data.class_number} ${data.grad_year} ${data.curriculum}`,
                true,
                "didn't have enough of privilege",
            )
            sendError(res, 403, "You're not allowed to add this class");
        }
    });
}

export const DELETE: Operation = async (req, res) => {
    const data = parseBody<typeof Service.deleteClass>(req);
    const logger = ServerLogger.getLogger('student.delete');

    if (!validateLogin(req, res, logger)) return;

    const student = await StudentService.get(req.session.student_uid);
    const class_ = await ClassService.get(data.grad_year, data.class_number);
    if (class_ === undefined) {
        logger.logComposed(
            req.session.student_uid,
            Actions.delete, `${data.class_number} ${data.grad_year}`,
            true,
            "the class didn't exist",
            true,
        );
        sendError(res, 403, "You are not authorized to delete this class");
        return;
    }

    const classResource = new RoleResource({
        classNumber: class_.class_number as number,
        gradYear: class_.grad_year,
        curriculum: class_.curriculum_name,
    });
    const privilege = await RoleService.privilege(RoleService.studentToRoleResource(student), classResource);

    if (!privilege.delete) {
        logger.logComposed(
            req.session.student_uid,
            Actions.delete,
            `${data.class_number} ${data.grad_year}`,
            true,
            "didn't have enough privilege",
            true,
        );
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
                logger.logComposed(
                    req.session.student_uid,
                    Actions.delete,
                    `${data.class_number} ${data.grad_year}`,
                    true,
                    "affected 0 row",
                    true,
                );
                sendSuccess(res, { message: 'No class affected' });
            }
            else {
                logger.logComposed(
                    req.session.student_uid,
                    Actions.delete,
                    `${data.class_number} ${data.grad_year}`,
                );
                sendSuccess(res, { message: 'Successfully deleted the class' });
            }
        })
        .catch((err) => dbHandleError(err, res, logger.logger));
}