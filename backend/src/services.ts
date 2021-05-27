import { pg } from ".";
import { Class, Curriculum, StudentClassRole, StudentRole, StudentVisibility } from "./generated/schema";
import { Role } from "./generated/schema";

type Privilege = {
    read: boolean,
    update: boolean,
    delete: boolean,
    grant: boolean // The privilege to grant administrator privileges
}

export const ClassService = {
    get: async (grad_year: number, class_number: number): Promise<Class & Curriculum> => {
        return pg('class')
            .select()
            .joinRaw('NATURAL JOIN curriculum')
            .where({
                grad_year: grad_year,
                class_number: class_number
            })
            .first<Class & Curriculum>();
    }
}

export const RoleService = {
    get: async (student_uid: number): Promise<Role> => {
        return pg('student')
            .select('role')
            .joinRaw('NATURAL JOIN role')
            .where('student_uid', student_uid)
            .first<Role>();
    },
    privilege: async (current_uid: number, target_uid: number): Promise<Privilege> => {
        const [current, target] = [await StudentService.get(current_uid), await StudentService.get(target_uid)];
        let privilege = {
            read: false,
            update: false,
            delete: false,
            grant: false,
        }

        if (!!!current || !!!target) {
            // If either of the users in action don't exist, we consider target inaccessible at all
            return privilege;
        }

        const isSameStudent = current_uid === target_uid;
        const isSameYear = current.grad_year === target.grad_year;
        const isSameCurriculum = isSameYear && current.curriculum_uid === target.curriculum_uid;
        const isSameClass = isSameYear && current.class_number === target.class_number;
        // Only students in the same year with higher privilege level are adminable over another student
        const isAdminable = isSameYear && ((current.level as number) > (target.level as number));

        // For any user, we check the visibility first
        switch (target.visibility_type) {
            case StudentVisibility.Private:
                privilege.read = isSameStudent;
                break;
            case StudentVisibility.Class:
                privilege.read = isSameClass;
                break;
            case StudentVisibility.Curriculum:
                privilege.read = isSameCurriculum;
                break;
            case StudentVisibility.Year:
                privilege.read = isSameYear;
                break;
            case StudentVisibility.Students:
                privilege.read = true;
                break;
        }

        switch (current.role) {
            case StudentRole.Student:
                privilege.update = privilege.delete = isSameStudent;
                return privilege;
            case StudentRole.Class:
                // Prevent overriding the value of privilege.read by false
                privilege.read = privilege.read || isSameClass;
                privilege.update = privilege.delete = isSameClass;
                return privilege;
            case StudentRole.Curriculum:
                // Prevent overriding the value of privilege.read by false
                privilege.read = privilege.read || isSameCurriculum;
                privilege.update = privilege.delete = isSameCurriculum;
                privilege.grant = isAdminable;
                return privilege;
            case StudentRole.Year:
                // Prevent overriding the value of privilege.read by false
                privilege.read = privilege.read || isSameYear;
                privilege.update = isSameYear;
                privilege.delete = privilege.grant = isAdminable;
                return privilege;
            case StudentRole.System:
                privilege.read = privilege.update = privilege.delete = privilege.grant = true;
                return privilege;
            default:
                return privilege;
        }
    }
}

export const StudentService = {
    get: async (student_uid: number): Promise<StudentClassRole> => {
        return pg('student_class_role')
            .select()
            .where('student_uid', student_uid)
            .first<StudentClassRole>();
    }
}