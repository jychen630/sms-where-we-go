import { Operation } from 'express-openapi';
import log4js from 'log4js';
import { pg } from '..';
import { Student as StudentRes, School as SchoolRes, StudentVerbose } from '../generated';
import { City, School, StudentClassRole, StudentVisibility } from '../generated/schema';
import { RoleService } from '../services';
import { parseHiddenFields, removeKeys, removeNull, sendError, sendSuccess } from '../utils';
import { studentFieldVisibility } from './student';

export const get: Operation = async (req, res, next) => {
    const logger = log4js.getLogger('roster');
    if (!!!req.session.identifier) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to access the roster');
    }
    else {
        const self = await pg.select<StudentClassRole>().from('wwg.student_class_role')
            .where('student_uid', req.session.student_uid).first();

        if (!!!self || !self.class_number || !self.curriculum_name || !self.grad_year) {
            logger.error(`Invalid user: ${self}`)
            sendError(res, 403, 'Invalid user');
            return;
        }

        const queryStudents = pg.select()
            .from<StudentClassRole>('wwg.student_class_role')
            .where('student_uid', req.session.student_uid)
            .as("current")
            .union(
                pg('wwg.student_class_role').select()
                    .where('visibility_type', StudentVisibility.Class)
                    .andWhere('class_number', self.class_number as number)
                    .andWhere('grad_year', self.grad_year),
                pg('wwg.student_class_role').select()
                    .where('visibility_type', StudentVisibility.Curriculum)
                    .andWhere('curriculum_name', self.curriculum_name)
                    .andWhere('grad_year', self.grad_year),
                pg('wwg.student_class_role').select()
                    .where('visibility_type', StudentVisibility.Year)
                    .andWhere('grad_year', self.grad_year),
                pg('wwg.student_class_role').select()
                    .where('visibility_type', StudentVisibility.Students)
            )
            .as('students')
        pg(queryStudents)
            .select<(StudentClassRole & { hidden_fields: string | null })[]>()
            .leftOuterJoin(studentFieldVisibility, 'field_visibility.student_uid', 'students.student_uid')
            .then(async (students) => {
                logger.info('Successfully GET roster');
                const schools = await pg.select().from<School & City>('wwg.school')
                    .joinRaw('NATURAL JOIN city')
                    .whereIn('school_uid', Object.values(students.map((student) => student.school_uid)));

                const tempStudents = students.map<Partial<StudentRes & StudentVerbose>>((student) => {
                    const privilege = RoleService.privilegeSync(self, student);
                    return removeKeys(removeNull({
                        uid: student.student_uid,
                        name: student.name,
                        class_number: student.class_number,
                        grad_year: student.grad_year,
                        curriculum: student.curriculum_name,
                        phone_number: student.phone_number,
                        email: student.email,
                        wxid: student.wxid,
                        department: student.department,
                        major: student.major,
                        school_uid: student.school_uid,
                        test: student.hidden_fields
                    }), parseHiddenFields(student.hidden_fields), privilege);
                });

                sendSuccess(res, {
                    schools: schools.map((school) => {
                        return removeNull({
                            uid: school.school_uid,
                            latitude: school.latitude,
                            longitude: school.longitude,
                            school_name: school.name,
                            school_country: school.country,
                            school_state_province: school.state_province,
                            city: school.city,
                            students: tempStudents.filter((student) => student.school_uid === school.school_uid)
                        } as SchoolRes);
                    }).filter(school => school.students !== undefined && school.students.length > 0)
                });
            }).catch((err) => {
                logger.error(err);
                sendError(res, 500);
            });
    }
}
