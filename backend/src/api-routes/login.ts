import knex from 'knex';
import { Operation } from 'express-openapi';
import { pgOptions } from '../index';

export const post: Operation = async (req, res, next) => {
    if (!!req.session.identifier) {
        res.send('Relogin');
        console.log(req.session.identifier);
        res.send(JSON.stringify({
            result: "success",
            message: "",
        }));
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
        if(req.body.password === "test"){
            res.send(JSON.stringify({
                result: "success",
                message: "",
            }));
        }
        else {
            res.send(JSON.stringify({
                result: "error",
                message: "Password is incorrect!",
            }));
        }
    }
}
