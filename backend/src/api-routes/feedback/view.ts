import { Operation } from "express-openapi";
import { pg } from "../..";
import { Comment, Feedback } from "../../generated/schema";
import { Actions, dbHandleError, getSelf, sendSuccess, ServerLogger, validateLogin } from "../../utils";

export const parseFeedbackComments = (feedbacks: Feedback[], comments: Comment[]) => {
    return feedbacks.map(val => ({
        feedback_uid: val.feedback_uid,
        grad_year: val.grad_year,
        class_number: val.class_number,
        title: val.title,
        content: val.content,
        reason: val.reason,
        email: val.email,
        phone_number: val.phone_number,
        sender_uid: val.sender_uid,
        status: val.status,
        posted_at: val.posted_at,
        comments: comments.filter(comment => comment.feedback_uid === val.feedback_uid).map(val => ({
            content: val.content,
            sender_name: val.sender_name,
            posted_at: val.posted_at
        }))
    }))
}

export const get: Operation = async (req, res) => {
    const logger = ServerLogger.getLogger('feedback.view.get');

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(self => {
        pg('feedback')
            .select<Feedback[]>()
            .modify<any, Feedback[]>((qb) => {
                if (!!self.phone_number) {
                    qb.orWhere('phone_number', self.phone_number);
                }
                if (!!self.email) {
                    qb.orWhere('email', self.email);
                }
                if (self.student_uid !== undefined) {
                    qb.orWhere('sender_uid', self.student_uid);
                }
            })
            .then(async result => {
                const comments = await pg('comment')
                    .select<Comment[]>()
                    .whereIn('feedback_uid', result.map(val => val.feedback_uid));
                logger.logComposed(self, Actions.access, 'private feedbacks');
                sendSuccess(res, {
                    feedbacks: parseFeedbackComments(result, comments)
                });
            })
            .catch(err => dbHandleError(err, res, logger.logger));
    });
}