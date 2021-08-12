import { Operation } from "express-openapi";
import log4js from "log4js";
import { pg } from "..";
import {
    Student as StudentRes,
    School as SchoolRes,
    StudentVerbose,
} from "../generated";
import {
    City,
    School,
    StudentClassRole,
    StudentVisibility,
} from "../generated/schema";
import { RoleService } from "../services";
import {
    Actions,
    dbHandleError,
    getSelf,
    parseHiddenFields,
    removeKeys,
    removeNull,
    sendError,
    sendSuccess,
    ServerLogger,
    validateLogin,
} from "../utils";
import { studentFieldVisibility } from "./student";

export const get: Operation = async (req, res, next) => {
    const logger = ServerLogger.getLogger("roster");
    if (!validateLogin(req, res, logger)) return;

    getSelf(
        req,
        res,
        logger,
        (self) =>
            !!self.class_number || !!self.curriculum_name || !!self.grad_year
    ).then((self) => {
        const queryStudents = pg
            .select()
            .from<StudentClassRole>("wwg.student_class_role")
            .where("student_uid", req.session.student_uid)
            .as("current")
            .union(
                pg("wwg.student_class_role")
                    .select()
                    .where("visibility_type", StudentVisibility.Class)
                    .andWhere("class_number", self.class_number as number)
                    .andWhere("grad_year", self.grad_year),
                pg("wwg.student_class_role")
                    .select()
                    .where("visibility_type", StudentVisibility.Curriculum)
                    .andWhere("curriculum_name", self.curriculum_name)
                    .andWhere("grad_year", self.grad_year),
                pg("wwg.student_class_role")
                    .select()
                    .where("visibility_type", StudentVisibility.Year)
                    .andWhere("grad_year", self.grad_year),
                pg("wwg.student_class_role")
                    .select()
                    .where("visibility_type", StudentVisibility.Students)
            )
            .as("students");
        pg(queryStudents)
            .select<(StudentClassRole & { hidden_fields: string | null })[]>()
            .leftOuterJoin(
                studentFieldVisibility,
                "field_visibility.student_uid",
                "students.student_uid"
            )
            .then(async (students) => {
                logger.logComposed(self, Actions.access, "roster");
                const schools = await pg
                    .select()
                    .from<School & City>("wwg.school")
                    .joinRaw("NATURAL JOIN city")
                    .whereIn(
                        "school_uid",
                        Object.values(
                            students.map((student) => student.school_uid)
                        )
                    );

                const tempStudents = students.map<
                    Partial<StudentRes & StudentVerbose>
                >((student) => {
                    const privilege = RoleService.privilegeSync(self, student);
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
                            test: student.hidden_fields,
                        }),
                        parseHiddenFields(student.hidden_fields),
                        privilege
                    );
                });

                sendSuccess(res, {
                    schools: schools
                        .map((school) => {
                            return removeNull({
                                uid: school.school_uid,
                                latitude: school.latitude,
                                longitude: school.longitude,
                                school_name: school.name,
                                school_country: school.country,
                                school_state_province: school.state_province,
                                city: school.city,
                                students: tempStudents.filter(
                                    (student) =>
                                        student.school_uid === school.school_uid
                                ),
                            } as SchoolRes);
                        })
                        .filter(
                            (school) =>
                                school.students !== undefined &&
                                school.students.length > 0
                        ),
                });
            })
            .catch((err) => dbHandleError(err, res, logger.logger));
    });
};
