import { Operation } from 'express-openapi';
import log4js from 'log4js';
import { pg } from '..';
import { Student, School as SchoolRes } from '../generated';
import { City, School, StudentVisibility } from '../generated/schema';
import { StudentClass } from '../generated/schema';
import { removeNull, sendError, sendSuccess } from '../utils';

export const get: Operation = async (req, res, next) => {
    const logger = log4js.getLogger('roster');
    if (!!!req.session.identifier) {
        logger.info('User not identified');
        sendError(res, 403, 'Please login to access the roster');
    }
    else {
        const student = await pg.select<StudentClass>().from('wwg.student_class')
            .where('student_uid', req.session.student_uid).first();

        if (!!!student || !student.class_number || !student.curriculum_name || !student.grad_year) {
            logger.error(`Invalid user: ${student}`)
            sendError(res, 403, 'Invalid user');
            return;
        }

        pg.select().from<StudentClass>('wwg.student_class')
            .where('student_uid', req.session.student_uid)
            .as("current")
            .union(
                pg('wwg.student_class').select()
                    .where('visibility_type', StudentVisibility.Class)
                    .andWhere('class_number', student.class_number as number)
                    .andWhere('grad_year', student.grad_year),
                pg('wwg.student_class').select()
                    .where('visibility_type', StudentVisibility.Curriculum)
                    .andWhere('curriculum_name', student.curriculum_name)
                    .andWhere('grad_year', student.grad_year),
                pg('wwg.student_class').select()
                    .where('visibility_type', StudentVisibility.Year)
                    .andWhere('grad_year', student.grad_year),
                pg('wwg.student_class').select()
                    .where('visibility_type', StudentVisibility.Students)
            )
            .then(async (students) => {
                logger.info('Successfully GET roster');
                const schools = await pg.select().from<School & City>('wwg.school')
                    .joinRaw('NATURAL JOIN city')
                    .whereIn('school_uid', Object.values(students.map((student) => student.school_uid)));
                sendSuccess(res, {
                    students: students.map((student) => {
                        const result = removeNull({
                            ...student,
                            uid: student.student_uid,
                            grad_year: student.grad_year as any,
                        } as Student);
                        delete result.password_hash;
                        delete result.visibility_type;
                        delete result.role;
                        return result;
                    }),
                    schools: schools.map((school) => {
                        return removeNull({
                            uid: school.school_uid,
                            latitude: school.latitude,
                            longitude: school.longitude,
                            school_name: school.name,
                            school_country: school.country,
                            school_state_province: school.state_province,
                            city: school.city
                        } as SchoolRes);
                    })
                });
            }).catch((err) => {
                logger.error(err);
                sendError(res, 500);
            });
    }
}
