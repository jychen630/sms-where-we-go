import { Operation } from "express-openapi";
import hash, { hashSync } from "bcrypt";
import { pg } from "..";
import { Knex } from "knex";
import { Service } from "../generated";
import {
    Actions,
    dbHandleError,
    getSelf,
    parseBody,
    parseHiddenFields,
    parseQuery,
    removeKeys,
    removeNull,
    sendError,
    sendSuccess,
    ServerLogger,
    validateAdmin,
    validateLogin,
} from "../utils";
import { ClassService, RoleService, StudentService } from "../services";
import {
    City,
    School,
    StudentClassRole,
    StudentRole,
    StudentVisibility,
} from "../generated/schema";
import { ArrayType } from "../wwg_types/custom_types";

// These are the fields that will not be stored in the database
export const pseudoFields = ["school_name"];

export const studentFieldVisibility = pg(
    pg("wwg.student_field_visibility").select().where("hidden", true).as("temp")
)
    .column("student_uid", { hidden_fields: pg.raw("array_agg(field)") })
    .groupBy("student_uid")
    .as("field_visibility");

export const get: Operation = async (req, res, next) => {
    const data = parseQuery<typeof Service.getStudent>(req) as any;
    const logger = ServerLogger.getLogger("student.get");

    if (!validateLogin(req, res, logger)) return;

    getSelf(req, res, logger).then((self) => {
        const queryStudent = pg("wwg.student_class_role")
            .modify<any, StudentClassRole[]>(async (qb) => {
                if (!(typeof self.level === "number")) {
                    return;
                }
                if (!!data.self) {
                    qb.select().where("student_uid", self.student_uid);
                    return;
                }
                if (self.level >= 16) {
                    // System admin can access all students
                    qb.select();
                    return;
                }
                let union = [];
                if (self.level < 16) {
                    qb.select().where("student_uid", self.student_uid);
                    union.push(
                        pg("wwg.student_class_role")
                            .select()
                            .where("visibility_type", StudentVisibility.Year)
                            .andWhere("grad_year", self.grad_year),
                        pg("wwg.student_class_role")
                            .select()
                            .where(
                                "visibility_type",
                                StudentVisibility.Students
                            )
                    );
                }
                if (self.level < 8) {
                    union.push(
                        pg("wwg.student_class_role")
                            .select()
                            .where(
                                "visibility_type",
                                StudentVisibility.Curriculum
                            )
                            .andWhere("curriculum_name", self.curriculum_name)
                            .andWhere("grad_year", self.grad_year)
                    );
                }
                if (self.level < 4) {
                    union.push(
                        pg("wwg.student_class_role")
                            .select()
                            .where("visibility_type", StudentVisibility.Class)
                            .andWhere(
                                "class_number",
                                self.class_number as number
                            )
                            .andWhere("grad_year", self.grad_year)
                    );
                }
                if (self.level < 2) {
                    union.push(
                        pg("wwg.student_class_role")
                            .select()
                            .where("visibility_type", StudentVisibility.Private)
                            .andWhere("student_uid", self.student_uid)
                    );
                } else {
                    union.push(
                        pg("wwg.student_class_role")
                            .select()
                            .where("visibility_type", StudentVisibility.Private)
                    );
                }
                qb.union(union);
            })
            .as("t1");

        const querySchool = pg("wwg.school")
            .column({ school_name: "name" }, "school_uid", "city_uid")
            .select()
            .as("t2");

        const addFilters =
            (hiddenFieldsColumn?: string) => (qb: Knex.QueryBuilder) => {
                if (!!data["self"]) {
                    qb.where("t1.student_uid", self.student_uid);
                    return;
                }
                if (!!data["name"]) {
                    qb.where("t1.name", "LIKE", `%${data["name"]}%`);
                    !!hiddenFieldsColumn &&
                        qb.orWhereRaw(`name = ANY(${hiddenFieldsColumn}})`);
                }
                if (!!data["phone_number"]) {
                    qb.where(
                        "phone_number",
                        "LIKE",
                        `%${data["phone_number"]}%`
                    );
                    !!hiddenFieldsColumn &&
                        qb.orWhereRaw(
                            `phone_number = ANY(${hiddenFieldsColumn}})`
                        );
                }
                if (!!data["curriculum"]) {
                    qb.where(
                        "curriculum_name",
                        "LIKE",
                        `%${data["curriculum"]}%`
                    );
                }
                if (!!data["city"]) {
                    qb.where("city.city", "LIKE", `%${data["city"]}%`);
                    !!hiddenFieldsColumn &&
                        qb.orWhereRaw(`name = ANY(${hiddenFieldsColumn}})`);
                }
                if (!!data["school_state_province"]) {
                    qb.where(
                        "city.state_province",
                        "LIKE",
                        `%${data["school_state_province"]}%`
                    );
                    !!hiddenFieldsColumn &&
                        qb.orWhereRaw(
                            `school_uid = ANY(${hiddenFieldsColumn}})`
                        );
                }
                if (!!data["school_country"]) {
                    qb.where(
                        "city.country",
                        "LIKE",
                        `%${data["school_country"]}%`
                    );
                    !!hiddenFieldsColumn &&
                        qb.orWhereRaw(
                            `school_uid = ANY(${hiddenFieldsColumn}})`
                        );
                }
                if (!!data["limit"]) {
                    qb.limit(data["limit"])
                }
                if (!!data["offset"]) {
                    qb.offset(data["offset"])
                }
            };

        pg(queryStudent)
            .distinctOn("student_uid")
            .column(
                "t1.student_uid",
                "t1.name",
                "t1.class_number",
                "t1.grad_year",
                "t1.curriculum_name",
                "t1.phone_number",
                "t1.email",
                "t1.wxid",
                "t1.department",
                "t1.major",
                "t1.role",
                "t1.visibility_type",
                "t1.level",
                "t2.school_uid",
                "t2.school_name",
                "city.city",
                "city.country",
                "city.state_province",
                "hidden_fields"
            )
            .select()
            .leftOuterJoin(querySchool, "t1.school_uid", "t2.school_uid")
            .leftOuterJoin("city", "city.city_uid", "t2.city_uid")
            .leftOuterJoin(
                studentFieldVisibility,
                "field_visibility.student_uid",
                "t1.student_uid"
            )
            .modify<
                any,
                (StudentClassRole &
                    School &
                    City & {
                        school_name: string;
                        hidden_fields: string | null;
                    })[]
            >(addFilters())
            .then(async (students) => {
                const privilegeTemp = await Promise.all(
                    students.map(async (student) => {
                        return await RoleService.privilege(self, student);
                    })
                );
                students = students.filter(
                    (_, index) =>
                        privilegeTemp[index].read &&
                        (!!!data["can_update_only"] ||
                            privilegeTemp[index].update)
                );
                logger.logComposed(
                    self,
                    Actions.access,
                    "students",
                    false,
                    undefined,
                    false,
                    data
                );
                sendSuccess(res, {
                    students: await Promise.all(
                        students.map(async (student, index) => {
                            const privilege = privilegeTemp[index];
                            const hiddenFields = parseHiddenFields(
                                student.hidden_fields
                            );
                            return removeKeys(
                                removeNull({
                                    uid: student.student_uid,
                                    name: student.name,
                                    class_number: student.class_number,
                                    grad_year: student.grad_year,
                                    curriculum: student.curriculum_name,
                                    phone_number: student.phone_number,
                                    email: student.email,
                                    wxid: student.wxid,
                                    department: student.department,
                                    major: student.major,
                                    school_uid: student.school_uid,
                                    school_name: student.school_name,
                                    school_country: student.country,
                                    school_state_province:
                                        student.state_province,
                                    city: student.city,
                                    self:
                                        self.student_uid === student.student_uid
                                            ? true
                                            : undefined,
                                    // Field visibility are only visible to the users themselves
                                    field_visibility:
                                        self.student_uid === student.student_uid
                                            ? ((obj: any) => {
                                                hiddenFields.forEach(
                                                    (val) =>
                                                        (obj[val] = false)
                                                );
                                                return obj;
                                            })({})
                                            : undefined,
                                    // Role and visibility are only visible to admins or the users themselves
                                    role:
                                        privilege.level > 0 ||
                                            self.student_uid === student.student_uid
                                            ? student.role
                                            : undefined,
                                    visibility:
                                        privilege.level > 0 ||
                                            self.student_uid === student.student_uid
                                            ? student.visibility_type
                                            : undefined,
                                }),
                                hiddenFields,
                                privilege
                            );
                        })
                    ),
                });
            })
            .catch((err) => dbHandleError(err, res, logger.logger));
    });
};

export const put: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.updateStudent>(req);
    const logger = ServerLogger.getLogger("student.update");
    // TODO: A student can clear their email first and then clear the phone number later in separate requests
    // to bypass the restriction that either email or phone number should be set. This needs to be solved in
    // the future by adding SQL constraints or manual checks through fetching students beforehand.
    const clear =
        data.clear?.reduce<Set<ArrayType<typeof data.clear>>>((accu, curr) => {
            accu.add(curr);
            return accu;
        }, new Set()) ?? new Set();

    if (!validateLogin(req, res, logger)) return;

    if (clear.has("email") && clear.has("phone_number")) {
        data.password = undefined;
        // @ts-ignore
        data.confirm = undefined;
        logger.logComposed(
            req.session.student_uid,
            Actions.update,
            `${data.student_uid ?? req.session.student_uid
            }'s phone_number and email`,
            false,
            "phone_number and email cannot be cleared at the same time",
            true,
            data
        );
        sendError(
            res,
            400,
            "You cannot clear email and phone number at the same time"
        );
        return;
    }

    // Try to update the requester by default
    const target_uid = data.student_uid ?? req.session.student_uid;
    const privileges = await RoleService.privilege(
        req.session.student_uid,
        target_uid
    );

    if (!privileges.update) {
        data.password = undefined;
        // @ts-ignore
        data.confirm = undefined;
        logger.logComposed(
            req.session.student_uid,
            Actions.update,
            `${target_uid.toString()}`,
            false,
            "the user didn't have enough privilege",
            true,
            { data: data, privileges: privileges }
        );
        sendError(
            res,
            403,
            "You are not allowed to update this student's information"
        );
        return;
    }

    if (privileges.level < 16 && !!data.grad_year) {
        sendError(
            res,
            403,
            `You are not allowed to update the graduation year`
        );
        data.password = undefined;
        // @ts-ignore
        data.confirm = undefined;
        logger.logComposed(
            req.session.student_uid,
            Actions.update,
            `${target_uid.toString()}'s grad_year`,
            false,
            "the user didn't have enough privilege",
            true,
            { data: data, privileges: privileges }
        );
        return;
    }

    if (privileges.level < 4 && !!data.class_number) {
        sendError(res, 403, `You are not allowed to update the class number`);
        data.password = undefined;
        // @ts-ignore
        data.confirm = undefined;
        logger.logComposed(
            req.session.student_uid,
            Actions.update,
            `${target_uid.toString()}'s class_number`,
            false,
            "the user didn't have enough privilege",
            true,
            { data: data, privileges: privileges }
        );
        return;
    }

    if (
        !!data.role &&
        (!privileges.grant ||
            (data.role === StudentRole.Class.valueOf() &&
                privileges.level < 4) ||
            (data.role === StudentRole.Curriculum.valueOf() &&
                privileges.level < 8) ||
            (data.role === StudentRole.Year.valueOf() &&
                privileges.level < 16) ||
            (data.role === StudentRole.System.valueOf() &&
                privileges.level < 16))
    ) {
        data.password = undefined;
        // @ts-ignore
        data.confirm = undefined;
        logger.logComposed(
            req.session.student_uid,
            Actions.update,
            target_uid.toString(),
            false,
            `${privileges.grant
                ? "the privilege level was too low"
                : "the role was not allow for this operation"
            }`,
            true,
            { data: data, privileges: privileges }
        );
        sendError(
            res,
            403,
            `You are not allowed to alter this student\'s role${privileges.grant
                ? ` to '${data.role}' as your privilege level is ${privileges.level}`
                : ""
            }`
        );
        return;
    }

    /*
    verification code check is disabled until we have the sms support
    if (!!data.phone_number && data.verification_code) {
        logger.info(`Tried to update phone number without verification code`);
        sendError(res, 400, 'You must provide a verification code when changing the phone number');
        return;
    }*/

    let hashed = undefined;
    if (!!data.password) {
        hashed = hashSync(data.password, 10);
    }

    if (!!data.field_visibility) {
        const prepared = Object.entries(data.field_visibility)
            .map(([key, val]) => ({
                student_uid: target_uid,
                field: key,
                hidden: !val, // "Field visibility" and "hidden" are semantically opposite
            }))
            .filter((val) => !pseudoFields.includes(val.field));
        if (prepared.length > 0) {
            try {
                await pg("student_field_visibility")
                    .select()
                    .insert(prepared)
                    .onConflict(["student_uid", "field"])
                    .merge();
            } catch (err) {
                dbHandleError(err, res, logger.logger);
                return;
            }
        }
    }

    if (
        Object.entries(data).some(
            ([key, val]) =>
                key !== "student_uid" &&
                key !== "hidden" &&
                !(val === undefined || val === null)
        )
    ) {
        pg("student")
            .select()
            .where("student_uid", target_uid)
            .update({
                name: data.name,
                phone_number: clear.has("phone_number")
                    ? null
                    : data.phone_number,
                email: clear.has("email") ? null : data.email,
                password_hash: hashed,
                wxid: data.wxid,
                department: data.department,
                major: data.major,
                class_number: data.class_number,
                grad_year: data.grad_year,
                school_uid: clear.has("school_uid") ? null : data.school_uid,
                visibility_type: data.visibility,
                role: data.role,
            })
            .then(async (result) => {
                data.password = undefined;
                // @ts-ignore
                data.confirm = undefined;
                logger.logComposed(
                    req.session.student_uid,
                    Actions.update,
                    `${target_uid}'s information${!!!data.student_uid ? " (self-update)" : ""
                    }`,
                    false,
                    undefined,
                    false,
                    data
                );
                sendSuccess(res);
            })
            .catch((err) => dbHandleError(err, res, logger.logger));
    } else {
        sendSuccess(res);
    }
};

//type: ignore
export const DELETE: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.deleteStudent>(req);
    const logger = ServerLogger.getLogger("student.delete");

    if (!validateLogin(req, res, logger)) return;

    const privilege = await RoleService.privilege(
        req.session.student_uid,
        data.student_uid
    );

    if (!privilege.delete) {
        logger.logComposed(
            req.session.student_uid,
            Actions.delete,
            `student ${data.student_uid}`,
            false,
            "the user didn't have enough privilege",
            true,
            { data: data, privileges: privilege }
        );
        sendError(res, 403, "You are not authorized to delete this user");
        return;
    }

    pg("wwg.student")
        .delete()
        .where("student_uid", data.student_uid)
        .then((result) => {
            if (result === 0) {
                logger.logComposed(
                    req.session.student_uid,
                    Actions.delete,
                    `student ${data.student_uid}`,
                    false,
                    "no students affected",
                    true
                );
                sendSuccess(res, { message: "No students affected" });
            } else {
                logger.logComposed(
                    req.session.student_uid,
                    Actions.delete,
                    `student ${data.student_uid}`,
                    false,
                    undefined,
                    false
                );
                sendSuccess(res, {
                    message: "Successfully deleted the student",
                });
            }
        })
        .catch((err) => dbHandleError(err, res, logger.logger));
};

export const post: Operation = async (req, res, next) => {
    const data = parseBody<typeof Service.postStudent>(req);
    const logger = ServerLogger.getLogger("register");
    let [class_number, grad_year] = [undefined as any, undefined as any];

    if (!!data.registration_key) {
        // If the user uses a registration key, we fetch the regitration info for them
        const registrationInfo = (
            (await pg("wwg.registration_key")
                .select()
                .where("registration_key", data.registration_key)
                .where("expiration_date", ">", new Date().toISOString())) as any
        )[0];

        if (!!!registrationInfo) {
            data.password = "";
            //@ts-ignore
            data.confirm = undefined;
            logger.logComposed(
                "Visitor",
                Actions.create,
                "a user",
                false,
                `the registration key ${data.registration_key} is invalid`,
                true,
                data
            );
            sendError(
                res,
                200,
                "The registration key is invalid, please double-check or contact the administrator"
            );
            return;
        }
        class_number = registrationInfo.class_number;
        grad_year = registrationInfo.grad_year;
    } else {
        // If the user doesn't use registration key, we do extra checks
        if (!!!req.session.student_uid) {
            sendError(
                res,
                400,
                "The registration key is required if you are not an administrator"
            );
            return;
        }

        const student = await StudentService.get(req.session.student_uid);

        if (student === undefined) {
            logger.logComposed(
                req.session.student_uid,
                Actions.create,
                "a user without a registration key",
                false,
                "the user is invalid",
                true
            );
            sendError(res, 403, "Invalid user for this operation");
            return;
        }

        if (!validateAdmin(res, student, logger)) return;

        if (!!!data.class_number || !!!data.grad_year) {
            logger.logComposed(
                req.session.student_uid,
                Actions.create,
                "a user without a registration key",
                false,
                "the user didn't supply the class number and the graduation year",
                true
            );
            sendError(
                res,
                400,
                "Please supply the class number and the graduation year when not using a registration key"
            );
            return;
        }

        if (
            student.role !== StudentRole.System &&
            data.grad_year !== student.grad_year
        ) {
            logger.logComposed(
                req.session.student_uid,
                Actions.create,
                "a user without a registration key",
                false,
                `the user cannot register for graduation year other than ${student.grad_year}`,
                true
            );
            sendError(
                res,
                400,
                `Cannot register with graduation year other than ${student.grad_year}`
            );
            return;
        }

        const class_ = await ClassService.get(
            data.grad_year,
            data.class_number
        );

        if (!!!class_) {
            logger.logComposed(
                req.session.student_uid,
                Actions.create,
                "a user without a registration key",
                false,
                `the class ${data.grad_year} ${data.class_number} doesn't exist`,
                true
            );
            sendError(
                res,
                400,
                `Cannot register with a class ${data.class_number} which doesn't exist`
            );
            return;
        }

        if (
            (student.level as number) < 4 &&
            data.class_number !== student.class_number
        ) {
            sendError(
                res,
                400,
                `Cannot register with class number other than ${student.class_number}`
            );
            logger.logComposed(
                req.session.student_uid,
                Actions.create,
                `a user ${data.name} without a registration key`,
                false,
                `the user cannot register with class_number ${class_.class_number}`,
                true
            );
            return;
        }

        if (
            (student.level as number) < 8 &&
            class_.curriculum_name !== student.curriculum_name
        ) {
            sendError(
                res,
                400,
                `Cannot register with curriculum other than ${student.curriculum_name}`
            );
            logger.logComposed(
                req.session.student_uid,
                Actions.create,
                `a user ${data.name} without a registration key`,
                false,
                `the user cannot register with curriculum ${class_.curriculum_name}`,
                true
            );
            return;
        }

        grad_year = data.grad_year;
        class_number = data.class_number;
    }

    hash.hash(data.password, 10).then((hashed) => {
        pg("student")
            .insert({
                name: data.name,
                phone_number: data.phone_number,
                email: data.email,
                password_hash: hashed,
                wxid: data.wxid,
                department: data.department,
                major: data.major,
                class_number: class_number,
                grad_year: grad_year,
                school_uid: data.school_uid,
            })
            .then((result) => {
                data.password = "";
                //@ts-ignore
                data.confirm = undefined;
                logger.logComposed(
                    req.session.student_uid ?? "Visitor",
                    Actions.create,
                    `a user ${data.name}`,
                    false,
                    undefined,
                    false,
                    data
                );
                sendSuccess(res);
            })
            .catch((err) => dbHandleError(err, res, logger.logger));
    });
};
