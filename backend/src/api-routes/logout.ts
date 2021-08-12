import { Operation } from "express-openapi";
import {
    Actions,
    sendError,
    sendSuccess,
    ServerLogger,
    validateLogin,
} from "../utils";

export const get: Operation = (req, res) => {
    const logger = ServerLogger.getLogger("logout");

    if (!validateLogin(req, res, logger)) return;

    const identifier = req.session.identifier;

    req.session.destroy((err) => {
        if (!!err) {
            logger.logComposed(
                identifier,
                Actions.access,
                "logout",
                false,
                err,
                true,
                err
            );
            sendError(res, 500, "Failed to logout");
        } else {
            logger.logComposed(identifier, Actions.access, "logout");
            sendSuccess(res);
        }
    });
};
