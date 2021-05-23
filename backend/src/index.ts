import express from 'express';
import { initialize } from 'express-openapi';
import dotenv from 'dotenv';
import session from 'express-session';
import knex from 'knex';
import path from 'path';

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
    }).catch((err) => { console.log(err.detail); });
    await pg('wwg.class').insert({
        class_number: 2,
        grad_year: 2019,
        curriculum_uid: 1
    }).catch((err) => { console.log(err.detail); });
    await pg('wwg.school').insert({
        name: "Test School",
        position: pg.raw('(34,-34)'),
        country: "United States",
        city: "test city"
    }).catch((err) => { console.log(err.detail); });
    await pg('wwg.student').insert({
        name: "test_std",
        phone_number: "18923232323",
        password_hash: "asddfgggjjasddfgggjjasddfgggjjasddfgggjjasddfgggjjasddfgggjj",
        salt: "asdfgertasdfgertasdfgertasdfgert",
        class_number: 2,
        grad_year: 2019,
        curriculum_uid: 1,
        school_uid: 1
    }).catch((err) => { console.log(err.detail); });;
    await pg('wwg.student').select().then((data) => {
        console.log(data);
    });
};
populateTestData().catch((err) => {
    console.log(err);
});

dotenv.config()
app.use(session({
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: false
}));

initialize({
    app,
    apiDoc: './openapi.yaml',
    paths: path.resolve(__dirname, 'api-routes'),
    consumesMiddleware: {
        'application/json': express.json()
    },
    errorMiddleware: function (err: any, req: any, res: any, next) {
        console.log(err);
        res.status(err.status).send(JSON.stringify({
            result: "error",
            message: err.errors ?? err.type
        }));
    }
});

app.get('/', (req, res) => {
    res.send('testwas');
});

app.listen(port, () => {
    console.log(`Start listening at ${port}`);
});