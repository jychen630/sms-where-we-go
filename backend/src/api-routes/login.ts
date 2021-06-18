import hash from 'bcrypt';
import log4js from 'log4js';
import { Operation } from 'express-openapi';
import { pg } from '../index';
import { parseBody, sendError, sendSuccess } from '../utils';
import { Service } from '../generated';

export const post: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.login>(req);
    const logger = log4js.getLogger('login');

    if (!!!data.password) {
        sendError(res, 400, "The password cannot be empty");
        logger.error(`${data.identifier} attempts to login with an empty password`);
        return;
    }

    if (data.use_uid && typeof data.identifier !== 'number') {
        sendError(res, 400, 'The identifier must be a number when using uid');
        logger.error(`${data.identifier} attempts to login with a non-number uid`);
        return;
    }

    const result = await pg("wwg.student")
        .column('student_uid', 'password_hash')
        .select()
        .where(function (pg) {
            if (data.use_uid) {
                return pg
                    .where("student_uid", data.identifier);
            }
            else {
                return pg
                    .where("phone_number", data.identifier)
                    .orWhere("email", data.identifier);
            }
        })
        .first();

    const password_hash = result?.password_hash ?? "";

    hash.compare(data.password, password_hash).then((succedded) => {
        if (succedded) {
            req.session.identifier = data.identifier;
            req.session.student_uid = result.student_uid;
            sendSuccess(res);
            logger.info(`${data.identifier} logged in successfully`);
        }
        else {
            sendError(res, 200, "The identifier or the password is incorrect");
            logger.info(`${data.identifier} fails to login due to incorrect identifier/password`);
        }
    }).catch((err) => {
        sendError(res, 500, "An internal error has occurred");
        logger.info(`Internal error:${err}`);
    });
}
