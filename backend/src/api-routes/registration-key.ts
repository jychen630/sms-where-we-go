import { randomBytes } from "crypto";
import { Operation } from "express-openapi";
import log4js from 'log4js';
import { pg } from "..";
import { RegistrationKeyInfo, Service } from "../generated";
import { Class, RegistrationKey } from "../generated/schema";
import { ClassService, RoleResource, RoleService, StudentService } from "../services";
import { dbHandleError, parseBody, parseQuery, sendError, sendSuccess } from "../utils";

export const get: Operation = async (req, res) => {
    const data = parseQuery<typeof Service.getRegistrationKey>(req) as any;
    const logger = log4js.getLogger('registrationKey.get');

    if (!!!req.session.identifier) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to access the registration keys');
        return;
    }

    const student = await StudentService.get(req.session.student_uid);

    if (!!!student) {
        logger.info(`The user is invalid (uid: ${req.session.student_uid})`);
        sendError(res, 403, 'The user is invalid for this operation');
        return;
    }

    if (student.level as number < 2) {
        logger.info(`User not allowed for this operation (uid: ${student.student_uid}, level:${student.level})`);
        sendError(res, 403, 'You are not allowed to access the registration keys');
        return;
    }

    pg('wwg.registration_key').joinRaw('NATURAL JOIN wwg.class')
        .select()
        .modify<(RegistrationKey & Class)[], (RegistrationKey & Class)[]>((qb) => {
            if (data['notExpired']) {
                qb.where(
                    'expiration_date', '>', new Date().toISOString()
                )
            }

            if (student.level as number < 16) {
                qb.where('registration_key.grad_year', student.grad_year);
            }

            if (student.level as number < 8) {
                qb.where('curriculum_name', student.curriculum_name);
            }

            if (student.level as number < 4) {
                qb.where('registration_key.class_number', student.class_number as number);
            }
        })
        .limit(data['limit'] ?? 20)
        .offset(data['offset'] ?? 0)
        .then((result) => {
            sendSuccess(res, {
                'registration_keys': result.map<Required<RegistrationKeyInfo & { registration_key: string, activated: boolean }>>(value => ({
                    registration_key: value.registration_key,
                    expiration_date: value.expiration_date.toISOString(),
                    grad_year: value.grad_year,
                    class_number: value.class_number as number,
                    curriculum: value.curriculum_name,
                    activated: value.activated
                })),
            });
        })
        .catch((err) => dbHandleError(err, res, logger));
}

export const post: Operation = async (req, res) => {
    let data = parseBody<typeof Service.postRegistrationKey>(req);
    const logger = log4js.getLogger('registrationKey.post');

    if (!!!req.session.identifier) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to create registration keys');
        return;
    }

    const student = await StudentService.get(req.session.student_uid);

    if (!!!student || student.grad_year === null) {
        logger.info(`The user is invalid (uid: ${req.session.student_uid})`);
        sendError(res, 403, 'The user is invalid for this operation');
        return;
    }

    const [classNumber, gradYear] = [data?.class_number ?? student.class_number as number, data?.grad_year ?? student.grad_year];

    const class_ = await ClassService.get(gradYear, classNumber);
    if (!!!class_) {
        sendError(res, 400, `Cannot create a registration key for a class ${classNumber}, ${gradYear} that doesn't exist`);
        return;
    }

    const registrationKeyRole = new RoleResource({
        classNumber: classNumber,
        curriculum: class_.curriculum_name,
        gradYear: gradYear,
        level: 1
    });
    const privilege = await RoleService.privilege(RoleService.studentToRoleResource(student), registrationKeyRole);

    if (!privilege.update) {
        logger.info(`User is not allowed for this operation (uid: ${student.student_uid}, level:${student.level})`);
        sendError(res, 403, 'You are not allowed to create this registration key');
        return;
    }

    let expirationDate = new Date()
    const prefix = expirationDate.getUTCFullYear().toString() + (expirationDate.getUTCMonth() + 1).toString().padStart(2, '0')
    expirationDate.setDate(expirationDate.getDate() + 7);

    pg('wwg.registration_key')
        .insert({
            registration_key: prefix + randomBytes(16).toString('hex').slice(0, 8),
            expiration_date: expirationDate,
            class_number: classNumber,
            grad_year: gradYear,
        } as RegistrationKey)
        .returning('registration_key')
        .then(result => {
            sendSuccess(res, { registration_key: JSON.stringify(result[0]) });
        })
        .catch((err) => dbHandleError(err, res, logger));
}

export const put: Operation = async (req, res) => {
    const data = parseBody<typeof Service.updateRegistrationKey>(req);
    const logger = log4js.getLogger('registrationKey.update');

    if (!!!req.session.identifier) {
        logger.info('User not identified');
        sendError(res, 401, 'Please login to create registration keys');
        return;
    }

    const student = await StudentService.get(req.session.student_uid);

    if (!!!student) {
        logger.info(`The user is invalid (uid: ${req.session.student_uid})`);
        sendError(res, 403, 'The user is invalid for this operation');
        return;
    }

    if (!!!data.expiration_date || !!!data.registration_key) {
        sendError(res, 400, 'Registration key and expiration date are required');
        logger.info(`Invalid expiration_date or registration_key (uid: ${req.session.student_uid})`);
        return;
    }

    const registrationKey = await pg('wwg.registration_key').joinRaw('NATURAL JOIN wwg.class').select<RegistrationKey & Class>().where('registration_key', data.registration_key).where('expiration_date', new Date(data.expiration_date)).first();

    const privilege = await RoleService.privilege(RoleService.studentToRoleResource(student), RoleService.registrationKeyToRoleResource(registrationKey))
    if (!privilege.update) {
        logger.info(`User is not allowed for updating registrationKey ${registrationKey?.registration_key} (exp: ${registrationKey?.expiration_date.toISOString()}) (uid: ${student.student_uid}, level: ${student.level})`)
        sendError(res, 403, 'You are not allowed to update this registration key');
        return;
    }

    pg('wwg.registration_key')
        .update('activated', data.activate ?? true)
        .where('registration_key', data.registration_key)
        .where('expiration_date', new Date(data.expiration_date))
        .returning('registration_key')
        .then((result) => {
            if (result.length > 0) {
                logger.info(`${student.student_uid} updated ${registrationKey} to ${data.activate ?? true}`);
                sendSuccess(res);
            }
            else {
                logger.info(`${student.student_uid} failed to update ${registrationKey}`);
                sendError(res, 200, 'No registration key was updated');
            }
        })
        .catch(err => dbHandleError(err, res, logger));
}