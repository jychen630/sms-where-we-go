import { Operation } from 'express-openapi';
import log4js from 'log4js';
import { pg } from '..';
import { Student } from '../generated';
import { sendError, sendSuccess } from '../utils';

export const get: Operation = async (req, res, next) => {
    const logger = log4js.getLogger('roster');
    if (!!!req.session.identifier) {
        sendError(res, 403, 'Please login to access the roster');
    }
    else {
        const student = await pg.select<Omit<Student, 'curriculum'> & { curriculum_uid: number }>().from('wwg.student_class')
            .where('student_uid', req.session.student_uid).first();
        console.log(student)

        if (!!!student || !student.class_number || !student.curriculum_uid || !student.grad_year) {
            sendError(res, 403, 'Invalid user');
            return;
        }

        pg.select().from('wwg.student_class')
            .where('student_uid', req.session.student_uid)
            .as("current")
            .union(
                pg('wwg.student_class').select()
                    .where('visibility_type', 'class')
                    .andWhere('class_number', student.class_number)
                    .andWhere('grad_year', student.grad_year),
                pg('wwg.student_class').select()
                    .where('visibility_type', 'curriculum')
                    .andWhere('curriculum_uid', student.curriculum_uid)
                    .andWhere('grad_year', student.grad_year),
                pg('wwg.student_class').select()
                    .where('visibility_type', 'year')
                    .andWhere('grad_year', student.grad_year),
                pg('wwg.student_class').select()
                    .where('visibility_type', 'student')
            )
            .then((result) => {
                logger.info(result);
                sendSuccess(res, {
                    students: result.map((item) => {
                        delete item.password_hash;
                        delete item.visibility_type;
                        Object.entries(item).forEach(([key, value]) => (value === null) && delete item[key])
                        return item;
                    })
                });
            }).catch((err) => {
                logger.error(err);
                sendError(res, 500);
            });
    }
}
