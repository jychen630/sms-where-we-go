import { Operation } from "express-openapi";
import { pg } from "..";
import log4js from "log4js";
import { dbHandleError, parseBody, sendError, sendSuccess } from "../utils";
import { StudentClass } from "../generated/schema";
import { StudentService } from "../services";
import { Service } from "../generated";

export const get: Operation = (req, res) => {
    const logger = log4js.getLogger('getDevLogin');
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV !== 'development') {
        res.status(404).send();
        return;
    }
    pg<StudentClass>('wwg.student_class')
        .column('student_uid', 'name', 'grad_year', 'class_number', 'role')
        .select()
        .orderBy('student_uid')
        .then((result) => {
            sendSuccess(res, {
                'users': result.map(value => ({
                    uid: value.student_uid,
                    name: value.name,
                    class_number: value.class_number,
                    grad_year: value.grad_year,
                    role: value.role
                }))
            });
        })
        .catch(err => dbHandleError(err, res, logger));
}

export const post: Operation = async (req, res) => {
    const data = parseBody<typeof Service.postDevLogin>(req);

    if (process.env.NODE_ENV !== 'development') {
        res.status(404).send();
        return;
    }

    const student = await StudentService.get(data.uid);
    if (student === undefined || student.student_uid === null) {
        sendError(res, 200, "The student doesn't exists");
    }
    else {
        req.session.identifier = data.uid;
        req.session.student_uid = student.student_uid;
        sendSuccess(res, {
            role: student.role
        });
    }
}
