import { Operation } from 'express-openapi';
import knex from 'knex';
import hash from 'bcrypt';
import log4js from 'log4js';
import { pg } from '..';
import { Service } from '../generated';
import { parseBody, sendError, sendSuccess } from '../utils';

export const post: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.register>(req);
    const logger = log4js.getLogger('register');

    const registrationInfo = (await pg('registration_key').select()
        .where(
            'registration_key', data.registration_key
        )
        .where(
            'expiration_date', '>', new Date().toISOString()
        ) as any)[0];
    console.log(registrationInfo);
    if (!!!registrationInfo) {
        logger.info(`Invalid registration key "${data.registration_key}"`);
        sendError(res, 200, 'The registration key is invalid, please double-check or contact the administrator');
        return;
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
            class_number: registrationInfo.class_number,
            grad_year: registrationInfo.grad_year,
            curriculum_uid: registrationInfo.curriculum_uid,
            school_uid: data.school_uid,
        }).then((result) => {
            logger.info(`Successfully registered ${data.name} with the key "${data.registration_key}"`);
            sendSuccess(res);
        }).catch((err) => {
            if (err.code == 23505) {
                const matchGroup = err.detail.match("\\((.*)\\)=\\((.*)\\)");
                logger.error(err.detail);
                sendError(res, 200, `The ${matchGroup[1]} "${matchGroup[2]}" has already been taken`);
            }
            else {
                logger.error(err);
                sendError(res, 200, "");
            }
        });
    });
}
