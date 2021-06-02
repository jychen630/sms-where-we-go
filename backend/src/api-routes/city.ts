import { Operation } from "express-openapi";
import { getLogger } from "log4js";
import { pg } from "..";
import { Service } from "../generated";
import { parseQuery } from "../utils";

const logger = getLogger("city");

export const get: Operation = async (req, res) => {
    const data = parseQuery<typeof Service.getSchool>(req) as any;
}
