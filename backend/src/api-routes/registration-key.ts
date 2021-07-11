import { randomBytes } from "crypto";
import { Operation } from "express-openapi";
import log4js from 'log4js';
import { pg } from "..";
import { RegistrationKeyInfo, Service } from "../generated";
import { Class, RegistrationKey } from "../generated/schema";
import { ClassService, RoleResource, RoleService, StudentService } from "../services";
import { Actions, dbHandleError, getSelf, parseBody, parseQuery, sendError, sendSuccess, ServerLogger, validateAdmin, validateLogin } from "../utils";

export const get: Operation = async (req, res) => {
    const data = parseQuery<typeof Service.getRegistrationKey>(req) as any;
    const logger = ServerLogger.getLogger('registrationKey.get');

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(self => {
        if (!validateAdmin(res, self, logger, 2)) return;

        pg('wwg.registration_key').joinRaw('NATURAL JOIN wwg.class')
            .select()
            .modify<(RegistrationKey & Class)[], (RegistrationKey & Class)[]>((qb) => {
                if (data['notExpired']) {
                    qb.where(
                        'expiration_date', '>', new Date().toISOString()
                    )
                }

                if (self.level as number < 16) {
                    qb.where('registration_key.grad_year', self.grad_year);
                }

                if (self.level as number < 8) {
                    qb.where('curriculum_name', self.curriculum_name);
                }

                if (self.level as number < 4) {
                    qb.where('registration_key.class_number', self.class_number as number);
                }
            })
            .limit(data['limit'] ?? 20)
            .offset(data['offset'] ?? 0)
            .then((result) => {
                logger.logComposed(
                    self,
                    Actions.access,
                    'registration keys',
                )
                sendSuccess(res, {
                    'registration_keys': result.map<Required<RegistrationKeyInfo & { registration_key: string, activated: boolean }>>(value => ({
                        registration_key: value.registration_key,
                        expiration_date: value.expiration_date.toISOString(),
                        grad_year: value.grad_year,
                        class_number: value.class_number as number,
                        curriculum: value.curriculum_name,
                        activated: value.activated
                    })),
                });
            })
            .catch((err) => dbHandleError(err, res, logger.logger));
    })
}

export const post: Operation = async (req, res) => {
    let data = parseBody<typeof Service.postRegistrationKey>(req);
    const logger = ServerLogger.getLogger('registrationKey.post');

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(async self => {
        if (self.grad_year === null) {
            logger.logComposed(
                self,
                Actions.create,
                'a registration key',
                false,
                "the user didn't have a grad_year field",
                true,
                data,
            )
            sendError(res, 403, 'The user is invalid for this operation');
            return;
        }

        const [classNumber, gradYear] = [data?.class_number ?? self.class_number as number, data?.grad_year ?? self.grad_year];

        const class_ = await ClassService.get(gradYear, classNumber);
        if (!!!class_) {
            logger.logComposed(
                self,
                Actions.create,
                `a registration key for class ${classNumber}, ${gradYear}`,
                false,
                "the class didn't exist",
                true,
                data,
            )
            sendError(res, 400, `Cannot create a registration key for a class ${classNumber}, ${gradYear} that doesn't exist`);
            return;
        }

        const registrationKeyRole = new RoleResource({
            classNumber: classNumber,
            curriculum: class_.curriculum_name,
            gradYear: gradYear,
            level: 1
        });
        const privilege = await RoleService.privilege(RoleService.studentToRoleResource(self), registrationKeyRole);

        if (!privilege.update) {
            logger.logComposed(
                self,
                Actions.create,
                `a registration key for class ${classNumber}, ${gradYear}`,
                true,
                "the user didn't have enough privilege",
                true,
                data,
            )
            sendError(res, 403, 'You are not allowed to create this registration key');
            return;
        }

        let expirationDate = new Date()
        const prefix = expirationDate.getUTCFullYear().toString() + (expirationDate.getUTCMonth() + 1).toString().padStart(2, '0')
        expirationDate.setDate(expirationDate.getDate() + 7);

        pg('wwg.registration_key')
            .insert({
                registration_key: prefix + randomBytes(16).toString('hex').slice(0, 8),
                expiration_date: expirationDate,
                class_number: classNumber,
                grad_year: gradYear,
            } as RegistrationKey)
            .returning('registration_key')
            .then(result => {
                logger.logComposed(
                    self,
                    Actions.create,
                    `a registration key for class ${classNumber}, ${gradYear}`,
                    false,
                    undefined,
                    false,
                    { registration_key: result[0] },
                )
                sendSuccess(res, { registration_key: JSON.stringify(result[0]) });
            })
            .catch((err) => dbHandleError(err, res, logger.logger));
    })
}

export const put: Operation = async (req, res) => {
    const data = parseBody<typeof Service.updateRegistrationKey>(req);
    const logger = ServerLogger.getLogger('registrationKey.update');

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then(async self => {
        if (!!!data.expiration_date || !!!data.registration_key) {
            logger.logComposed(
                self,
                Actions.update,
                'a registration key',
                false,
                'the registration key is invalid',
                true,
                data,
            )
            sendError(res, 400, 'Registration key and expiration date are required');
            return;
        }

        try {
            const registrationKey = await pg('wwg.registration_key')
                .joinRaw('NATURAL JOIN wwg.class')
                .select<RegistrationKey & Class>()
                .where('registration_key', data.registration_key)
                .where('expiration_date', new Date(data.expiration_date))
                .first();
            const privilege = await RoleService.privilege(RoleService.studentToRoleResource(self), RoleService.registrationKeyToRoleResource(registrationKey))
            if (!privilege.update) {
                logger.logComposed(
                    self,
                    Actions.update,
                    `${registrationKey?.registration_key} (exp: ${registrationKey?.expiration_date.toISOString()}`,
                    true,
                    "the user didn't have enough privilege",
                    true,
                    data,
                )
                sendError(res, 403, 'You are not allowed to update this registration key');
                return;
            }

            pg('wwg.registration_key')
                .update('activated', data.activate ?? true)
                .where('registration_key', data.registration_key)
                .where('expiration_date', new Date(data.expiration_date))
                .returning('registration_key')
                .then((result) => {
                    if (result.length > 0) {
                        logger.logComposed(
                            self,
                            Actions.update,
                            `${registrationKey?.registration_key} (exp: ${registrationKey?.expiration_date.toISOString()}`,
                            false,
                            undefined,
                            false,
                            data,
                        );
                        sendSuccess(res);
                    }
                    else {
                        logger.logComposed(
                            self,
                            Actions.update,
                            `${registrationKey?.registration_key} (exp: ${registrationKey?.expiration_date.toISOString()}`,
                            false,
                            "no registration key was updated",
                            true,
                            data,
                        );
                        sendError(res, 200, 'No registration key was updated');
                    }
                })
                .catch(err => dbHandleError(err, res, logger.logger));
        }
        catch (err) {
            dbHandleError(err, res, logger.logger);
        }
    })
}