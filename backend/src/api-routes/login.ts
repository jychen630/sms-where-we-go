import knex from 'knex';
import hash from 'bcrypt';
import { Operation } from 'express-openapi';
import { logger, pgOptions } from '../index';
import { parseBody, sendError, sendSuccess } from '../utils';
import { Service } from '../generated';

export const post: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.login>(req);

    if (!!req.session.identifier) {
        // If the user already has created a session with the server, we simply continue with it
        sendSuccess(res);
        logger.info("Login using a previous session");
        return;
    }

    if (!!!data.password) {
        sendError(res, 400, "The password cannot be empty");
        logger.error("Attempt to login with an empty password");
        return
    }

    // If the user is not logged in previously, we need to fetch their hashed password and salt
    const pg = knex(pgOptions);
    const result = await pg("wwg.student")
        .column('password_hash')
        .select()
        .where({
            "phone_number": data.identifier
        })
        .orWhere({
            "email": data.identifier
        });
    pg.destroy();

    const password_hash = result[0]?.password_hash ?? "";

    hash.compare(data.password, password_hash).then((success) => {
        if (success) {
            req.session.identifier = data.identifier;
            sendSuccess(res);
            logger.info("Login successfully");
        }
        else {
            sendError(res, 200, "The identifier or the password is incorrect");
            logger.info("Fail to login due to incorrect identifier/password");
        }
    }).catch((err) => {
        sendError(res, 500, "An internal error has occurred");
        logger.info(`Internal error:${err}`);
    });
}
