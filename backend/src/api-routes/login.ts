import knex from 'knex';
import hash from 'bcrypt';
import { Operation } from 'express-openapi';
import { pgOptions } from '../index';
import { sendError, sendSuccess } from '../utils';

export const post: Operation = async (req, res, next) => {
    if (!!req.session.identifier) {
        // If the user already has created a session with the server, we simply continue with it
        sendSuccess(res);
        return;
    }

    if (!!!req.body.password) {
        sendError(res, 400, "The password cannot be empty");
        return
    }

    // If the user is not logged in previously, we need to fetch their hashed password and salt
    const pg = knex(pgOptions);
    const result = await pg("wwg.student")
        .column('password_hash')
        .select()
        .where({
            "phone_number": req.body.identifier
        })
        .orWhere({
            "email": req.body.identifier
        });
    pg.destroy();

    const password_hash = result[0]?.password_hash ?? "";

    hash.compare(req.body.password, password_hash).then((success) => {
        if (success) {
            req.session.identifier = req.body.identifier;
            sendSuccess(res);
        }
        else {
            sendError(res, 200, "The identifier or the password is incorrect");
        }
    }).catch((err) => {
        console.error(err);
        sendError(res, 500, "An internal error has occurred");
    });
}
