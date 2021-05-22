import { Operation } from 'express-openapi';

export const post: Operation = (req, res, next) => {
    res.send("success");
}
