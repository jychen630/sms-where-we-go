import { randomBytes } from "crypto";
import { Operation } from "express-openapi";
import { pg } from "../../..";
import { Service } from "../../../generated";
import { Feedback } from "../../../generated/schema";
import { Actions, dbHandleError, getSelf, parseBody, sendSuccess, ServerLogger, validateLogin } from "../../../utils";

export const post: Operation = (req, res) => {
    const data = parseBody<typeof Service.userReportFeedback>(req);
    const logger = ServerLogger.getLogger('feedback.report.user.post');

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then((self) => {
        const feedback_uid = randomBytes(11).toString('hex');

        pg('feedback')
            .insert({
                feedback_uid: feedback_uid,
                title: data.title,
                content: data.content,
                reason: data.reason,
                sender_uid: self.student_uid,
                name: self.name,
                phone_number: self.phone_number,
                class_number: self.class_number,
                grad_year: self.grad_year,
                email: self.email
            } as Feedback)
            .then(() => {
                logger.logComposed(self, Actions.create, `feedback message ${feedback_uid}`);
                sendSuccess(res, { feedback_uid: feedback_uid });
            })
            .catch(err => dbHandleError(err, res, logger.logger))
    })
}