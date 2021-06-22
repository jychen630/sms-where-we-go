import { Operation } from "express-openapi";
import { pg } from "../../..";
import { Service } from "../../../generated";
import { Actions, dbHandleError, getSelf, parseBody, sendError, sendSuccess, ServerLogger, validateAdmin, validateLogin } from "../../../utils";

export const put: Operation = (req, res) => {
    const logger = ServerLogger.getLogger('feedback.update.put');
    const data = parseBody(req) as Parameters<typeof Service.updateFeedback>[1];
    const feedbackUid = req.params.feedback_uid;

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(async self => {
        if (!await validateAdmin(res, self, logger)) return;

        pg('feedback')
            .update('status', data.status)
            .where('feedback_uid', feedbackUid)
            .then(result => {
                if ((result as any) === 1) {
                    logger.logComposed(self, Actions.update, `feedback ${feedbackUid}`, false, undefined, false, { status: data.status });
                    sendSuccess(res);
                }
                else {
                    logger.logComposed(self, Actions.update, `feedback ${feedbackUid}`, false, 'nothing is updated');
                    sendError(res, 200, 'Nothing is updated');
                }
            })
            .catch(err => dbHandleError(err, res, logger.logger));
    });
}