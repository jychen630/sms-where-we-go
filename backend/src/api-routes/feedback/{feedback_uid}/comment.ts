import { Operation } from "express-openapi";
import { pg } from "../../..";
import { Service } from "../../../generated/build";
import { Actions, dbHandleError, getSelf, parseBody, sendSuccess, ServerLogger, validateLogin } from "../../../utils";

export const post: Operation = async (req, res) => {
    const data = parseBody(req) as Parameters<typeof Service.commentFeedback>[1];
    const logger = ServerLogger.getLogger('feedback.comment.post');

    if (!validateLogin(req, res, logger)) return;

    let name: string;
    if (!data.anonymous) {
        try {
            name = (await getSelf(req, res, logger)).name ?? 'unknown';
        }
        catch {
            return;
        }
    }
    else {
        name = 'anonymous';
    }

    pg('comment')
        .insert({
            feedback_uid: req.params.feedback_uid,
            sender_name: name,
            content: data.content
        })
        .then(() => {
            logger.logComposed(name, Actions.create, `comment ${req.params.feedback_uid}`, false, undefined, false, { content: data.content });
            sendSuccess(res);
        })
        .catch(err => dbHandleError(err, res, logger.logger))
}