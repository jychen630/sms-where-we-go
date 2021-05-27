import express from 'express';
import { initialize } from 'express-openapi';
import dotenv from 'dotenv';
import session from 'express-session';
import knex from 'knex';
import path from 'path';
import cors from 'cors';
import log4js from 'log4js';
import { sendError } from './utils';
import { pgOptions } from './pgconfig';
import { updateTypes } from 'knex-types';

const app = express();
const port = 8080;

export const pg = knex(pgOptions);
export const populateTestData = async () => {
    await pg('wwg.curriculum').insert([{
        name: "international"
    }, {
        name: "gaokao"
    }]);
    await pg('wwg.class').insert([{
        class_number: 2,
        grad_year: 2019,
        curriculum_uid: 1
    }, {
        class_number: 3,
        grad_year: 2019,
        curriculum_uid: 1
    }, {
        class_number: 2,
        grad_year: 2020,
        curriculum_uid: 1
    }, {
        class_number: 4,
        grad_year: 2019,
        curriculum_uid: 2
    }, {
        class_number: 5,
        grad_year: 2019,
        curriculum_uid: 2
    }]);
    await pg('wwg.school').insert({
        name: "Test School",
        position: pg.raw('point(34,-34)'),
        country: "United States",
        city: "test city"
    });
    await pg('wwg.student').insert([{
        name: "Ming",
        phone_number: "18923232323",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2019,
        school_uid: 1
    }, {
        name: "Dan",
        phone_number: "13988889999",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: 'class'
    }, {
        name: "Kang",
        phone_number: "13634343434",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2020,
        school_uid: 1,
        visibility_type: 'curriculum'
    }, {
        name: "Wang",
        phone_number: "18612344321",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2020,
        school_uid: 1,
        visibility_type: 'curriculum'
    }, {
        name: "Fang",
        phone_number: "13900002222",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 3,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: 'private'
    }, {
        name: "Zheng",
        phone_number: "13900006666",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 4,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: 'curriculum'
    }, {
        name: "Gao",
        phone_number: "18912346666",
        password_hash: "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 5,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: 'curriculum'
    }]);
    await pg('wwg.registration_key').insert({
        registration_key: "wwgasdfg",
        expiration_date: new Date('2022').toISOString(),
        class_number: 2,
        grad_year: 2019
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
const validationPattern = /^(.+)\.openapi\.requestValidation$/;
app.use(log4js.connectLogger(logger, { level: 'auto' }));

initialize({
    app,
    apiDoc: './openapi.yaml',
    paths: path.resolve(__dirname, 'api-routes'),
    consumesMiddleware: {
        'application/json': express.json()
    },
    errorMiddleware: function (err: any, req: any, res: any, next) {
        logger.info(err);

        if (err.type === 'entity.parse.failed') {
            sendError(res, err.status, 'The content format is invalid');
            return;
        }

        if (!!!err.errors || !(err.errors.length > 0)) {
            sendError(res, err.status, 'An unknown error has occurred');
            return;
        }

        const error = err.errors[0];
        const errCode = (error.errorCode as string).match(validationPattern);
        if (errCode) {
            sendError(res, err.status ?? 400, `[${errCode[1]}] "${error.path}" ${error.message}`);
        }
        else {
            sendError(res, err.status ?? 400, error.message ?? 'The input information is invalid');
        }
    }
});

// const output = "./src/generated/schema.ts";
// updateTypes(pg, { output: output }).catch((err) => logger.error(err));

app.get('/', (req, res) => {
    res.send('testwas');
});

app.listen(port, () => {
    console.log(`Start listening at ${port}`);
});