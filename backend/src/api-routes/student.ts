import { Operation } from 'express-openapi';
import hash, { hashSync } from 'bcrypt';
import log4js from 'log4js';
import { pg } from '..';
import { Service } from '../generated';
import { dbHandleError, parseBody, parseQuery, removeNull, sendError, sendSuccess } from '../utils';
import { ClassService, RoleService, StudentService } from '../services';
import { City, School, StudentClassRole, StudentRole, StudentVisibility } from '../generated/schema';
import { ArrayType } from '../wwg_types/custom_types';

export const get: Operation = async (req, res, next) => {
    const data = parseQuery<typeof Service.getStudent>(req) as any;
    const logger = log4js.getLogger('student.get');

    if (!!!req.session.student_uid) {
        logger.error(`Attempt to get ${req.session.student_uid} without authentication`);
        sendError(res, 401, 'Login to get student')
        return;
    }

    const self = await StudentService.get(req.session.student_uid);
    if (self === undefined) {
        logger.error(`Invalid user`);
        sendError(res, 403, 'Invalid user for this operation');
        return;
    }

    const subquery = pg('wwg.student_class_role')
        .modify<any, StudentClassRole[]>(
            async (qb) => {
                if (!(typeof self.level === 'number')) {
                    return;
                }
                if (!!data.self) {
                    qb.select().where('student_uid', self.student_uid);
                    return;
                }
                if (self.level >= 16) {
                    // System admin can access all students
                    qb.select();
                    return;
                }
                let union = [];
                if (self.level < 16) {
                    qb.select().where('student_uid', self.student_uid);
                    union.push(
                        pg('wwg.student_class_role').select()
                            .where('visibility_type', StudentVisibility.Year)
                            .andWhere('grad_year', self.grad_year),
                        pg('wwg.student_class_role').select()
                            .where('visibility_type', StudentVisibility.Students)
                    )
                }
                if (self.level < 8) {
                    union.push(
                        pg('wwg.student_class_role').select()
                            .where('visibility_type', StudentVisibility.Curriculum)
                            .andWhere('curriculum_name', self.curriculum_name)
                            .andWhere('grad_year', self.grad_year)
                    )
                }
                if (self.level < 4) {
                    union.push(
                        pg('wwg.student_class_role').select()
                            .where('visibility_type', StudentVisibility.Class)
                            .andWhere('class_number', self.class_number as number)
                            .andWhere('grad_year', self.grad_year)
                    )
                }
                if (self.level < 2) {
                    union.push(
                        pg('wwg.student_class_role').select()
                            .where('visibility_type', StudentVisibility.Private)
                            .andWhere('student_uid', self.student_uid)
                    )
                }
                else {
                    union.push(
                        pg('wwg.student_class_role').select()
                            .where('visibility_type', StudentVisibility.Private)
                    )
                }
                qb.union(union);
            }
        )
        .as('t1');
    const school = pg('wwg.school')
        .column({ 'school_name': 'name' }, 'school_uid', 'city_uid')
        .select()
        .as('t2')
    pg(subquery)
        .select()
        .leftOuterJoin(school, 't1.school_uid', 't2.school_uid')
        .leftOuterJoin('city', 'city.city_uid', 't2.city_uid')
        .modify<any, (StudentClassRole & School & City & { school_name: string })[]>((qb) => {
            if (!!data['self']) {
                qb.where('t1.student_uid', self.student_uid);
                return;
            }
            if (!!data['name']) {
                qb.where('t1.name', 'LIKE', `%${data['name']}%`);
            }
            if (!!data['phone_number']) {
                qb.where('phone_number', 'LIKE', `%${data['phone_number']}%`);
            }
            if (!!data['curriculum']) {
                qb.where('curriculum_name', 'LIKE', `%${data['curriculum']}%`);
            }
            if (!!data['city']) {
                qb.where('t2.city', 'LIKE', `%${data['city']}%`);
            }
            if (!!data['school_state_province']) {
                qb.where('t2.state_province', 'LIKE', `%${data['school_state_province']}%`);
            }
            if (!!data['school_country']) {
                qb.where('t2.country', 'LIKE', `%${data['school_country']}%`);
            }
        })
        .then(async (students) => {
            const privilegeTemp = await Promise.all(students.map(async (student) => {
                return await RoleService.privilege(self, student);
            }))
            students = students.filter((_, index) => privilegeTemp[index].read && (!!!data['can_update_only'] || privilegeTemp[index].update));
            logger.info(`Retrieved students for ${self.student_uid}`);
            sendSuccess(res, {
                students: await Promise.all(students.map(async (student, index) => {
                    const privilege = privilegeTemp[index];
                    return removeNull({
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
                        school_name: student.school_name,
                        school_country: student.country,
                        school_state_province: student.state_province,
                        city: student.city,
                        self: self.student_uid === student.student_uid ? true : undefined,
                        // Role and visibility are only visible to admins or the users themselves
                        role: privilege.level > 0 || self.student_uid === student.student_uid ? student.role : undefined,
                        visibility: privilege.level > 0 || self.student_uid === student.student_uid ? student.visibility_type : undefined
                    });
                }))
            });
        })
        .catch((err) => dbHandleError(err, res, logger));
}

export const put: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.updateStudent>(req);
    const logger = log4js.getLogger('student.update');
    // TODO: A student can clear their email first and then clear the phone number later in separate requests
    // to bypass the restriction that either email or phone number should be set. This needs to be solved in
    // the future by adding SQL constraints or manual checks through fetching students beforehand.
    const clear = data.clear?.reduce<Set<ArrayType<typeof data.clear>>>((accu, curr) => {
        accu.add(curr);
        return accu;
    }, new Set()) ?? new Set();

    if (!!!req.session.student_uid) {
        logger.error(`Attempt to update ${data.student_uid ?? '[uid not specified]'} without authentication`);
        sendError(res, 401, 'Login to update student information');
        return;
    }

    if (clear.has('email') && clear.has('phone_number')) {
        logger.error(`Attempt to clear ${data.student_uid ?? req.session.student_uid}'s phone_number and email at the same time`)
        sendError(res, 400, 'You cannot clear email and phone number at the same time');
        return;
    }

    // Try to update the requester by default
    const target_uid = data.student_uid ?? req.session.student_uid;
    const privileges = await RoleService.privilege(req.session.student_uid, target_uid);

    if (!privileges.update) {
        logger.error(`User update denied for ${data.student_uid} from ${req.session.student_uid} with privileges ${JSON.stringify(privileges)}`);
        logger.error(data);
        sendError(res, 403, 'You are not allowed to update this student\'s information');
        return;
    }

    if (privileges.level < 16 && !!data.grad_year) {
        sendError(res, 403, `You are not allowed to update the graduation year`);
        logger.error(`${req.session.identifier} attempts to update grad_year`);
        return;
    }

    if (privileges.level < 4 && !!data.class_number) {
        sendError(res, 403, `You are not allowed to update the class number`);
        logger.error(`${req.session.identifier} attempts to update class_number`);
        return;
    }

    if (!!data.role && (!privileges.grant ||
        (data.role === StudentRole.Class.valueOf() && privileges.level < 4) ||
        (data.role === StudentRole.Curriculum.valueOf() && privileges.level < 8) ||
        (data.role === StudentRole.Year.valueOf() && privileges.level < 16) ||
        (data.role === StudentRole.System.valueOf() && privileges.level < 16))) {
        logger.error(`${req.session.identifier} (level: ${privileges.level}) is denied for updating ${target_uid} ${privileges.grant ? 'for lower privilege level' : 'for role not allowed'}`);
        logger.error(data);
        sendError(res, 403, `You are not allowed to alter this student\'s role${privileges.grant ? ` to '${data.role}' as your privilege level is ${privileges.level}` : ''}`);
        return;
    }

    /*
    verification code check is disabled until we have the sms support
    if (!!data.phone_number && data.verification_code) {
        logger.info(`Tried to update phone number without verification code`);
        sendError(res, 400, 'You must provide a verification code when changing the phone number');
        return;
    }*/

    let hashed = undefined;
    if (!!data.password) {
        hashed = hashSync(data.password, 10);
    }

    pg('student')
        .select()
        .where('student_uid', target_uid)
        .update({
            name: data.name,
            phone_number: clear.has('phone_number') ? null : data.phone_number,
            email: clear.has('email') ? null : data.email,
            password_hash: hashed,
            wxid: data.wxid,
            department: data.department,
            major: data.major,
            class_number: data.class_number,
            grad_year: data.grad_year,
            school_uid: clear.has('school_uid') ? null : data.school_uid,
            visibility_type: data.visibility,
            role: data.role
        })
        .then(result => {
            logger.info(`Updated uid ${target_uid}'s information${!!!data.student_uid ? ' (self-update)' : ''}`);
            logger.info(data);
            sendSuccess(res);
        })
        .catch(err => dbHandleError(err, res, logger));
}

//type: ignore
export const DELETE: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.deleteStudent>(req);
    const logger = log4js.getLogger('student.delete');

    if (!!!req.session.student_uid) {
        sendError(res, 401, 'Login to delete student');
        return;
    }

    const privilege = await RoleService.privilege(req.session.student_uid, data.student_uid);

    if (!privilege.delete) {
        logger.error(`${req.session.student_uid} is denied from deleting ${data.student_uid}`);
        sendError(res, 403, 'You are not authorized to delete this user');
        return;
    }

    pg('wwg.student')
        .delete()
        .where('student_uid', data.student_uid)
        .then((result) => {
            if (result === 0) {
                logger.info(`${req.session.student_uid} failed to delete Student ${data.student_uid}`);
                sendSuccess(res, { message: 'No students affected' });
            }
            else {
                logger.info(`Student ${data.student_uid} is deleted by ${req.session.student_uid}`);
                sendSuccess(res, { message: 'Successfully deleted the student' });
            }
        }).catch((err) => {
            logger.error(err);
            sendError(res, 400, 'Failed to delete the student');
        });
}

export const post: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.postStudent>(req);
    const logger = log4js.getLogger('register');
    let [class_number, grad_year] = [undefined as any, undefined as any];

    if (!!data.registration_key) {
        // If the user uses a registration key, we fetch the regitration info for them
        const registrationInfo = (await pg('wwg.registration_key')
            .select()
            .where(
                'registration_key', data.registration_key
            )
            .where(
                'expiration_date', '>', new Date().toISOString()
            ) as any)[0];

        if (!!!registrationInfo) {
            logger.info(`Invalid registration key '${data.registration_key}'`);
            sendError(res, 200, 'The registration key is invalid, please double-check or contact the administrator');
            return;
        }
        class_number = registrationInfo.class_number;
        grad_year = registrationInfo.grad_year;
    }
    else {
        // If the user doesn't use registration key, we do extra checks
        if (!!!req.session.student_uid) {
            sendError(res, 400, 'The registration key is required if you are not an administrator');
            return;
        }

        const student = await StudentService.get(req.session.student_uid);

        if (student === undefined) {
            logger.error(`Invalid user`);
            sendError(res, 403, 'Invalid user for this operation');
            return;
        }

        if ((student.level as number) === 0) {
            sendError(res, 403, 'Only administrator can add users without registration keys');
            return;
        }

        if (!!!data.class_number || !!!data.grad_year) {
            sendError(res, 400, 'Please supply the class number and the graduation year when not using a registration key');
            return;
        }

        if (student.role !== StudentRole.System && data.grad_year !== student.grad_year) {
            sendError(res, 400, `Cannot register with graduation year other than ${student.grad_year}`);
            return;
        }

        const class_ = await ClassService.get(data.grad_year, data.class_number);

        if (!!!class_) {
            sendError(res, 400, `Cannot register with a class ${data.class_number} which doesn't exist`);
            return;
        }

        if ((student.level as number) < 4 && data.class_number !== student.class_number) {
            sendError(res, 400, `Cannot register with class number other than ${student.class_number}`);
            logger.error(`${student.name} failed to register for ${data.name} with curriculum ${class_.class_number}`);
            return;
        }

        if ((student.level as number) < 8 && class_.curriculum_name !== student.curriculum_name) {
            sendError(res, 400, `Cannot register with curriculum other than ${student.curriculum_name}`);
            logger.error(`${student.name} failed to register with curriculum ${class_.curriculum_name}`);
            return;
        }

        grad_year = data.grad_year;
        class_number = data.class_number;
    }



    hash.hash(data.password, 10).then((hashed) => {
        pg('student').insert({
            name: data.name,
            phone_number: data.phone_number,
            email: data.email,
            password_hash: hashed,
            wxid: data.wxid,
            department: data.department,
            major: data.major,
            class_number: class_number,
            grad_year: grad_year,
            school_uid: data.school_uid,
        }).then((result) => {
            logger.info(`Successfully registered ${data.name} with the key '${data.registration_key}'`);
            sendSuccess(res);
        }).catch((err) => dbHandleError(err, res, logger));
    });
}
