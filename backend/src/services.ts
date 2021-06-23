import axios from 'axios';
import { gcj02towgs84 } from 'coordtransform';
import log4js from 'log4js';
import { pg } from '.';
import { request } from './generated/core/request';
import { Class, RegistrationKey, StudentClassRole, StudentRole, StudentVisibility } from './generated/schema';
import { Role } from './generated/schema';

type Privilege = {
    read: boolean,
    update: boolean,
    delete: boolean,
    grant: boolean, // The privilege to grant administrator privileges
    level: number
}

const logger = log4js.getLogger('service');

export const ClassService = {
    get: async (grad_year: number, class_number: number): Promise<Class | undefined> => {
        return pg('class')
            .select()
            .where({
                grad_year: grad_year,
                class_number: class_number
            })
            .first<Class>();
    }
}

export interface IRoleResource {
    uid?: number
    gradYear: number
    curriculum: string
    classNumber: number
    role?: StudentRole
    visibility?: StudentVisibility
    level?: number
}
export class RoleResource implements IRoleResource {
    uid?: number
    gradYear: number
    curriculum: string
    classNumber: number
    role?: StudentRole
    visibility?: StudentVisibility
    level?: number
    constructor(props: IRoleResource) {
        this.uid = props.uid;
        this.gradYear = props.gradYear;
        this.curriculum = props.curriculum
        this.classNumber = props.classNumber;
        this.role = props.role;
        this.visibility = props.visibility;
        this.level = props.level;
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
    static compare(self: RoleResource, target: RoleResource) {
        const isSameYear = self.gradYear === target.gradYear
        return {
            isSame: self.uid === target.uid,
            isSameYear: isSameYear,
            isSameCurriculum: isSameYear && (self.curriculum === target.curriculum || target.curriculum === 'any'),
            isSameClass: isSameYear && self.classNumber === target.classNumber,
            // Only students in the same year with higher privilege level are adminable over another student
            isAdminable: isSameYear && (self.level !== undefined && target.level !== undefined) && (self.level > target.level),
        }
    }
    static registrationKeyToRoleResource(registrationKey?: RegistrationKey & Class): RoleResource | undefined {
        if (registrationKey === undefined) {
            return undefined;
        }

        return new RoleResource({
            gradYear: registrationKey?.grad_year ?? -1,
            curriculum: registrationKey?.curriculum_name ?? '',
            classNumber: registrationKey?.class_number as number ?? -1,
            level: 0
        });
    }
    static studentToRoleResource(student?: StudentClassRole): RoleResource | undefined {
        if (student === undefined) {
            return undefined;
        }
        if (typeof student.level !== 'number' || typeof student.class_number !== 'number' || student.grad_year === null || student.curriculum_name === null) {
            throw new Error(`Invalid student: ${JSON.stringify(student)}`);
        }

        return new RoleResource({
            uid: student.student_uid ?? undefined,
            gradYear: student.grad_year,
            curriculum: student.curriculum_name,
            classNumber: student.class_number,
            level: student.level,
            role: student.role ?? undefined,
            visibility: student.visibility_type ?? undefined
        })
    }
    static _privilegeImpl(current: RoleResource | undefined, target: RoleResource | undefined) {
        let privilege = {
            read: false,
            update: false,
            delete: false,
            grant: false,
            level: 0,
        }

        if (!!!current || !!!target) {
            // If either of the resources in action don't exist, we consider target inaccessible at all
            return privilege;
        }

        privilege.level = current.level ?? 0;

        const compare = this.compare(current, target);

        // For any user, we check the visibility first
        switch (target.visibility) {
            case StudentVisibility.Private:
                privilege.read = compare.isSame;
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
                privilege.update = privilege.delete = compare.isSame;
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
                privilege.delete = privilege.grant = (compare.isSameYear && compare.isAdminable) || compare.isSame;
                return privilege;
            case StudentRole.System:
                privilege.read = privilege.update = true;
                // Prevent system admins from lowering their own privilege level or deleting themselves
                privilege.grant = privilege.delete = !compare.isSame;
                return privilege;
            default:
                return privilege;
        }
    }
    static privilegeSync(current: StudentClassRole | undefined, target: StudentClassRole | undefined): Privilege;
    static privilegeSync(current: RoleResource | undefined, target: RoleResource | undefined): Privilege;
    static privilegeSync(...args: any[]): Privilege {
        let current: RoleResource | undefined, target: RoleResource | undefined;

        if (args[0] === undefined || args[1] === undefined) {
            return this._privilegeImpl(current, target);
        }

        if (!(args[0] instanceof RoleResource && args[1] instanceof RoleResource)) {
            [current, target] = [this.studentToRoleResource(args[0]), this.studentToRoleResource(args[1])];
        }
        else {
            [current, target] = [args[0], args[1]];
        }

        return this._privilegeImpl(current, target);
    }
    static async privilege(current_uid: number, target_uid: number): Promise<Privilege>;
    static async privilege(current: StudentClassRole | undefined, target: StudentClassRole | undefined): Promise<Privilege>;
    static async privilege(current: RoleResource | undefined, target: RoleResource | undefined): Promise<Privilege>;
    static async privilege(...args: any[]): Promise<Privilege> {
        let current: RoleResource | undefined, target: RoleResource | undefined;

        if (args[0] === undefined || args[1] === undefined) {
            return this._privilegeImpl(current, target);
        }

        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            [current, target] = [this.studentToRoleResource(await StudentService.get(args[0])), (this.studentToRoleResource(await StudentService.get(args[1])))];
        }
        else if (args[0] instanceof RoleResource && args[1] instanceof RoleResource) {
            [current, target] = args;
        }
        else {
            [current, target] = [this.studentToRoleResource(args[0]), this.studentToRoleResource(args[1])];
        }
        return this._privilegeImpl(current, target);
    }
}

export const LocationService = {
    constructAmapURL: (keywords: string, city: string, page: number) => {
        return encodeURI(`https://restapi.amap.com/v3/place/text?key=${process.env.AMAP_SECRET}&keywords=${keywords}&types=高等院校&city=${city}&children=1&offset=20&page=${page}&extensions=all`);
    },
    amap: async (keywords: string, city: string, page: number = 1) => {
        const url = LocationService.constructAmapURL(keywords, city, page);
        console.log(url);
        return axios.get(url)
            .then(res => {
                if (res.data.pois === undefined) {
                    return []
                }
                return res.data.pois.map((poi: any) => {
                    let [longitude, latitude] = poi.location.split(',');
                    try {
                        [longitude, latitude] = gcj02towgs84(longitude, latitude);
                    }
                    catch {
                        return Promise.reject('Failed to convert coordinates');
                    }

                    return {
                        name: poi.name,
                        city: poi.cityname ?? '',
                        address: poi.address.length !== 0 ? poi.address : '',
                        longitude: longitude,
                        latitude: latitude,
                    }
                })
            })
            .catch(err => {
                return Promise.reject(err);
            });
    },
    google: async (keywords: string, city: string, country: string) => {

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
