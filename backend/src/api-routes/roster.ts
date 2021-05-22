import { Operation } from 'express-openapi';

export const get: Operation = (req, res, next) => {
    res.send("success");
}
