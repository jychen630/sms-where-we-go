import { Operation } from "express-openapi";
import { pg } from "../..";
import { Feedback, Comment } from "../../generated/schema";
import { RoleResource, RoleService } from "../../services";
import { Actions, dbHandleError, getSelf, sendSuccess, ServerLogger, validateAdmin, validateLogin } from "../../utils";
import { parseFeedbackComments } from "./view";

export const get: Operation = async (req, res) => {
    const logger = ServerLogger.getLogger('feedback.manage.get');

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(self => {
        if (!validateAdmin(res, self, logger)) return;

        pg('feedback')
            .select<Feedback[]>()
            .then(async result => {
                let feedbacks = result.filter(feedback => {
                    if (feedback.class_number === null || feedback.grad_year === null) {
                        // By default, if the class number and the grad year are unspecified, the feedback can be seen by all admin users
                        return true;
                    }

                    const feedbackRole = new RoleResource({
                        classNumber: feedback.class_number,
                        curriculum: 'any',
                        gradYear: feedback.grad_year,
                        level: 1
                    });

                    const privilege = RoleService.privilegeSync(RoleService.studentToRoleResource(self), feedbackRole);
                    logger.logComposed(self, Actions.access, 'feedbacks', true, undefined, false, { privilege: privilege, feedback: feedback });
                    return privilege.update;
                })

                const comments = await pg('comment')
                    .select<Comment[]>()
                    .whereIn('feedback_uid', feedbacks.map(val => val.feedback_uid));

                logger.logComposed(self, Actions.access, 'feedbacks');
                sendSuccess(res, { feedbacks: parseFeedbackComments(feedbacks, comments) });
            })
            .catch(err => dbHandleError(err, res, logger.logger));
    });
}