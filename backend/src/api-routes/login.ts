import knex from 'knex';
import { Operation } from 'express-openapi';
import { pgOptions } from '../index';

export const post: Operation = async (req, res, next) => {
    if (!!req.session.identifier) {
        res.send('Relogin');
        console.log(req.session.identifier);
    }
    else {
        const pg = knex(pgOptions);
        const result = await pg("wwg.student")
            .column('password_hash', 'salt')
            .select()
            .where({
                "phone_number": req.body.identifier
            })
            .orWhere({
                "email": req.body.identifier
            });
        console.log(result);
        pg.destroy();
        req.session.identifier = req.body.identifier;

    }
    res.send('OK');
}
