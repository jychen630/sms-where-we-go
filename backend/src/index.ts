import express from 'express';
import { initialize } from 'express-openapi';
import dotenv from 'dotenv';
import session from 'express-session';
import knex from 'knex';
import path from 'path';
import cors from 'cors';
import log4js from 'log4js';
import { sendError } from './utils';

const app = express();
const port = 8080;
export const pgOptions = {
    client: 'pg',
    connection: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: "wwg_base"
    },
    searchPath: ['wwg', 'public'],
}
const pg = knex(pgOptions);
export const populateTestData = async () => {
    await pg('wwg.curriculum').insert({
        name: "international"
    });
    await pg('wwg.class').insert({
        class_number: 2,
        grad_year: 2019,
        curriculum_uid: 1
    });
    await pg('wwg.school').insert({
        name: "Test School",
        position: pg.raw('point(34,-34)'),
        country: "United States",
        city: "test city"
    });
    await pg('wwg.student').insert({
        name: "test_std",
        phone_number: "18923232323",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2019,
        curriculum_uid: 1,
        school_uid: 1
    });
    await pg('wwg.registration_key').insert({
        registration_key: "wwgasdf",
        expiration_date: new Date('2022').toISOString(),
        class_number: 2,
        grad_year: 2019,
        curriculum_uid: 1,
    });
};
populateTestData().catch(() => { });

dotenv.config()
app.use(session({
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: false
}));

app.use(cors());

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: `log/server-${new Date().toJSON().split(':').join('-').slice(0, -1)}.log` }
    },
    categories: {
        default: {
            appenders: [
                'console',
                'file'
            ],
            level: 'info'
        },
        express: {
            appenders: [
                'console',
                'file'
            ],
            level: 'info'
        }
    }
});
export const logger = log4js.getLogger('express');
app.use(log4js.connectLogger(logger, { level: 'auto' }));

initialize({
    app,
    apiDoc: './openapi.yaml',
    paths: path.resolve(__dirname, 'api-routes'),
    consumesMiddleware: {
        'application/json': express.json()
    },
    errorMiddleware: function (err: any, req: any, res: any, next) {
        logger.log(err);
        const error = err.errors[0];
        if (error.errorCode === 'pattern.openapi.requestValidation') {
            sendError(res, err.status ?? 400, `The content or the format of ${error.path} is incorrect`);
        }
        else {
            sendError(res, err.status ?? 400, error.message ?? 'The input information is invalid');
        }
    }
});

app.get('/', (req, res) => {
    res.send('testwas');
});

app.listen(port, () => {
    console.log(`Start listening at ${port}`);
});