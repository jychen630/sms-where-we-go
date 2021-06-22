import { randomBytes } from "crypto";
import { Operation } from "express-openapi";
import { pg } from "../../..";
import { Service } from "../../../generated";
import { Feedback } from "../../../generated/schema";
import { Actions, dbHandleError, parseBody, sendSuccess, ServerLogger } from "../../../utils";

export const post: Operation = (req, res) => {
    const data = parseBody<typeof Service.publicReportFeedback>(req);
    const logger = ServerLogger.getLogger('feedback.report.public.post');

    const feedback_uid = randomBytes(11).toString('hex');

    pg('feedback')
        .insert({
            feedback_uid: feedback_uid,
            title: data.title,
            content: data.content,
            reason: data.reason,
            name: data.name,
            phone_number: data.phone_number,
            class_number: data.class_number,
            grad_year: data.grad_year,
            email: data.email
        } as Feedback)
        .then(() => {
            logger.logComposed('Visitor', Actions.create, `feedback message ${feedback_uid}`);
            sendSuccess(res, { feedback_uid: feedback_uid });
        })
        .catch(err => dbHandleError(err, res, logger.logger))
}