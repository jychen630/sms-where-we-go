import { Operation } from 'express-openapi';
import { RoleService } from '../services';
import { sendError, sendSuccess } from '../utils';

export const get: Operation = (req, res) => {
    if (!!!req.session.student_uid) {
        sendError(res, 401, 'Please login to get the role');
        return;
    }

    RoleService.get(req.session.student_uid)
        .then((result) => {
            sendSuccess(res, {
                role: result.role,
                description: result.description
            });
        });
}