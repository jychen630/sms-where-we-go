import { Operation } from "express-openapi";
import { RoleService } from "../services";
import {
    Actions,
    dbHandleError,
    sendError,
    sendSuccess,
    ServerLogger,
    validateLogin,
} from "../utils";

export const get: Operation = (req, res) => {
    const logger = ServerLogger.getLogger("role.get");

    if (!validateLogin(req, res, logger)) return;

    RoleService.get(req.session.student_uid)
        .then((result) => {
            logger.logComposed(req.session.student_uid, Actions.access, "role");
            sendSuccess(res, {
                role: result.role,
                description: result.description,
            });
        })
        .catch((err) => dbHandleError(err, res, logger.logger));
};
