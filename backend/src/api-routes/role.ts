import { Operation } from 'express-openapi';
import { pg } from '..';
import { Service } from '../generated';
import { Role } from '../generated/schema';
import { sendError, sendSuccess } from '../utils';

export const get: Operation = (req, res) => {
    if (!!!req.session.student_uid) {
        sendError(res, 401, 'Please login to get the role');
        return;
    }

    pg('student')
        .select('role')
        .joinRaw('NATURAL JOIN role')
        .where('student_uid', req.session.student_uid)
        .first<Role>()
        .then((result) => {
            sendSuccess(res, {
                role: result.role,
                description: result.description
            });
        });
}