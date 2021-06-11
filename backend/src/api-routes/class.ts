import { Operation } from "express-openapi";
import { Service } from "../generated";
import { parseBody, parseQuery } from "../utils";

export const get: Operation = (req, res) => {
    const data = parseQuery<typeof Service.getClass>(req);
}

export const post: Operation = (req, res) => {
    const data = parseBody<typeof Service.postClass>(req);
}

export const DELETE: Operation = (req, res) => {
    const data = parseBody<typeof Service.deleteClass>(req);
}