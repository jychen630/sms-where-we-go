import { Operation } from "express-openapi";
import { pg } from "..";
import { Service } from "../generated";
import {
    Actions,
    parseBody,
    sendError,
    sendSuccess,
    ServerLogger,
} from "../utils";

export const post: Operation = (req, res, next) => {
    const data = parseBody<typeof Service.validate>(req);
    const logger = ServerLogger.getLogger("validate");

    pg("wwg.registration_key")
        .joinRaw("NATURAL JOIN wwg.class")
        .select()
        .where("registration_key", data.registration_key)
        .where("expiration_date", ">", new Date().toISOString())
        .where("activated", true)
        .then((result) => {
            if (result.length > 0) {
                sendSuccess(res, {
                    class_number: result[0].class_number,
                    grad_year: result[0].grad_year,
                    curriculum: result[0].curriculum_name,
                    expiration_date: result[0].expiration_date,
                });
                logger.logComposed(
                    req.session.student_uid ?? "Visitor",
                    Actions.access,
                    "registration key validation"
                );
            } else {
                sendError(res, 200, "The registration key is invalid");
                logger.logComposed(
                    req.session.student_uid ?? "Visitor",
                    Actions.access,
                    "registration key validation",
                    false,
                    "registration key is invalid",
                    false,
                    data
                );
            }
        });
};
