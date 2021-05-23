import express from 'express';
import { initialize } from 'express-openapi';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';

const app = express();
const port = 8080;

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