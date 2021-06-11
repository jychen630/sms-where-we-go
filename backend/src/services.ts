import log4js from 'log4js';
import { pg } from '.';
import { Class, Student, StudentClassRole, StudentRole, StudentVisibility } from './generated/schema';
import { Role } from './generated/schema';
import { compareStudents } from './utils';

type Privilege = {
    read: boolean,
    update: boolean,
    delete: boolean,
    grant: boolean, // The privilege to grant administrator privileges
    level: number
}

const logger = log4js.getLogger('service');

export const ClassService = {
    get: async (grad_year: number, class_number: number): Promise<Class> => {
        return pg('class')
            .select()
            .where({
                grad_year: grad_year,
                class_number: class_number
            })
            .first<Class>();
    }
}

export class RoleService {
    static async get(student_uid: number): Promise<Role> {
        return pg('student')
            .select('role')
            .joinRaw('NATURAL JOIN role')
            .where('student_uid', student_uid)
            .first<Role>();
    }
    static async privilege(current_uid: number, target_uid: number): Promise<Privilege>;
    static async privilege(current: StudentClassRole | undefined, target: StudentClassRole | undefined): Promise<Privilege>;
    static async privilege(...args: any[]): Promise<Privilege> {
        let current: StudentClassRole | undefined, target: StudentClassRole | undefined;
        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            [current, target] = [await StudentService.get(args[0]), await StudentService.get(args[1])];
        }
        else {
            [current, target] = args;
        }

        let privilege = {
            read: false,
            update: false,
            delete: false,
            grant: false,
            level: current?.level as number ?? 0,
        }

        if (!!!current || !!!target) {
            // If either of the users in action don't exist, we consider target inaccessible at all
            return privilege;
        }

        const compare = compareStudents(current, target);

        // For any user, we check the visibility first
        switch (target.visibility_type) {
            case StudentVisibility.Private:
                privilege.read = compare.isSameStudent;
                break;
            case StudentVisibility.Class:
                privilege.read = compare.isSameClass;
                break;
            case StudentVisibility.Curriculum:
                privilege.read = compare.isSameCurriculum;
                break;
            case StudentVisibility.Year:
                privilege.read = compare.isSameYear;
                break;
            case StudentVisibility.Students:
                privilege.read = true;
                break;
        }

        switch (current.role) {
            case StudentRole.Student:
                privilege.update = privilege.delete = compare.isSameStudent;
                return privilege;
            case StudentRole.Class:
                // Prevent overriding the value of privilege.read by false
                privilege.read = privilege.read || compare.isSameClass;
                privilege.update = privilege.delete = compare.isSameClass;
                privilege.grant = compare.isSameClass && compare.isAdminable;
                return privilege;
            case StudentRole.Curriculum:
                // Prevent overriding the value of privilege.read by false
                privilege.read = privilege.read || compare.isSameCurriculum;
                privilege.update = privilege.delete = compare.isSameCurriculum;
                privilege.grant = compare.isSameCurriculum && compare.isAdminable;
                return privilege;
            case StudentRole.Year:
                // Prevent overriding the value of privilege.read by false
                privilege.read = privilege.read || compare.isSameYear;
                privilege.update = compare.isSameYear;
                privilege.delete = privilege.grant = (compare.isSameYear && compare.isAdminable) || compare.isSameStudent;
                return privilege;
            case StudentRole.System:
                privilege.read = privilege.update = true;
                // Prevent system admins from lowering their own privilege level or deleting themselves
                privilege.grant = privilege.delete = !compare.isSameStudent;
                return privilege;
            default:
                return privilege;
        }
    }
}

export const StudentService = {
    get: async (student_uid: number): Promise<StudentClassRole | undefined> => {
        return pg('student_class_role')
            .select()
            .where('student_uid', student_uid)
            .first<StudentClassRole>();
    }
}

export const VerificationService = {
    sendCode: async (phone_number: number): Promise<number> => {
        const code = Math.floor((Math.random() * 99999 - 10000) + 10000);
        const params = {
            'RegionId': 'cn-hangzhou',
            'PhoneNumbers': phone_number,
            'SignName': 'WWG2020',
            'TemplateCode': 'SMS_200722868',
            'TemplateParam': `{\'code\':\'${code}\'}`,
        };
        const reqParams = {
            method: 'POST'
        };
        /*client.request('SendSms', params, reqParams).then((result) => {
            logger.info(`Sending sms verification to ${phone_number}`);
            return code;
        }, (err) => {
            logger.error(`Failed to send sms verification to ${phone_number}`);
            logger.error(err);
            return false;
        });
        verificationCodeTemp[req.query.phoneNum] = code*/
        throw new Error('Service not available');
    }
}
