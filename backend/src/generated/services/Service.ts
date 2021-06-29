/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { City } from '../models/City';
import type { Class } from '../models/Class';
import type { Coordinate } from '../models/Coordinate';
import type { Feedback } from '../models/Feedback';
import type { FeedbackComment } from '../models/FeedbackComment';
import type { FeedbackInfo } from '../models/FeedbackInfo';
import type { Limit } from '../models/Limit';
import type { Offset } from '../models/Offset';
import type { RegistrationKeyInfo } from '../models/RegistrationKeyInfo';
import type { Result } from '../models/Result';
import type { Role } from '../models/Role';
import type { School } from '../models/School';
import type { Student } from '../models/Student';
import type { StudentFieldsVisibility } from '../models/StudentFieldsVisibility';
import type { StudentVerbose } from '../models/StudentVerbose';
import type { Visibility } from '../models/Visibility';
import { request as __request } from '../core/request';

export class Service {

    /**
     * Return a roster containing the students and schools information
     * @returns any Sucessfully retrieved the roster
     * @throws ApiError
     */
    public static async getRoster(): Promise<(Result & {
schools: Array<(School & {
/**
 * The unique identifier of the school
 */
uid: number,
students?: Array<(Student & StudentVerbose)>,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/roster`,
            errors: {
                403: `Unauthorized to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Handle a login request
     * @param requestBody 
     * @returns Result Return whether the login is a success
     * @throws ApiError
     */
    public static async login(
requestBody: ({
password: string,
} & ({
/**
 * When set to true, the identifier will be used as the uid of the student
 */
use_uid?: boolean,
/**
 * The identifier of the username, which can be the uid, phone number or email
 */
identifier: string,
} | {
/**
 * When set to true, the identifier will be used as the uid of the student
 */
use_uid?: boolean,
/**
 * The identifier as a student uid
 */
identifier: number,
})),
): Promise<Result> {
        const result = await __request({
            method: 'POST',
            path: `/login`,
            body: requestBody,
            errors: {
                400: `Default response telling whether the request is successful`,
            },
        });
        return result.body;
    }

    /**
     * Only available in development. Get a list of available users to login
     * @returns any Successfully return the list of users.
     * @throws ApiError
     */
    public static async getDevLogin(): Promise<(Result & {
users?: Array<(StudentVerbose & {
role: Role,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/dev-login`,
        });
        return result.body;
    }

    /**
     * Only available in development. Login using the student with the specified uid, password is not required
     * @param requestBody 
     * @returns any Return the role of the logged in user
     * @throws ApiError
     */
    public static async postDevLogin(
requestBody: {
/**
 * The unique identifier of the user
 */
uid: number,
},
): Promise<(Result & {
role?: Role,
})> {
        const result = await __request({
            method: 'POST',
            path: `/dev-login`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Return the information of students. Result is scoped by the user role. For example: a "student" user cannot see others role and visibility settings, but an admin user, like those with the role "class" can. Apart from that, admin users can ignore the visibility settings of the students who are under their administration.
 * 
     * @param self 
     * @param canUpdateOnly 
     * @param name 
     * @param phoneNumber 
     * @param curriculum 
     * @param city 
     * @param schoolStateProvince 
     * @param schoolCountry 
     * @returns any Return a list of students
     * @throws ApiError
     */
    public static async getStudent(
self?: boolean,
canUpdateOnly: boolean = false,
name?: string,
phoneNumber?: string,
curriculum?: string,
city?: string,
schoolStateProvince?: string,
schoolCountry?: string,
): Promise<(Result & {
students?: Array<(Student & StudentVerbose & School & {
role?: Role,
visibility?: Visibility,
field_visibility?: StudentFieldsVisibility,
/**
 * Indicating whether the current student is the caller
 */
self?: boolean,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/student`,
            query: {
                'self': self,
                'can_update_only': canUpdateOnly,
                'name': name,
                'phone_number': phoneNumber,
                'curriculum': curriculum,
                'city': city,
                'school_state_province': schoolStateProvince,
                'school_country': schoolCountry,
            },
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Add a new student (registration key is required for new users)
     * @param requestBody 
     * @returns Result Default response telling whether the request is successful
     * @throws ApiError
     */
    public static async postStudent(
requestBody: (Student & {
name: string,
password: string,
curriculum?: any,
/**
 * The registration key provided by the maintainer for each class which fills class_number, year, and curriculum for the student
 */
registration_key: string,
} & ({
/**
 * The registration key provided by the maintainer for each class which fills class_number, year, and curriculum for the student
 */
registration_key: string,
} | {
class_number: number,
grad_year: number,
})),
): Promise<Result> {
        const result = await __request({
            method: 'POST',
            path: `/student`,
            body: requestBody,
            errors: {
                400: `Default response telling whether the request is successful`,
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Update the information of a student
     * @param requestBody 
     * @returns Result Default response telling whether the request is successful
     * @throws ApiError
     */
    public static async updateStudent(
requestBody: (Student & {
/**
 * If not specified, update the current logged in student
 */
student_uid?: number,
visibility?: Visibility,
role?: Role,
/**
 * The new password
 */
password?: string,
class_number?: number,
grad_year?: number,
curriculum?: any,
/**
 * The fields that need to be cleared
 */
clear?: Array<'email' | 'phone_number' | 'school_uid'>,
field_visibility?: StudentFieldsVisibility,
}),
): Promise<Result> {
        const result = await __request({
            method: 'PUT',
            path: `/student`,
            body: requestBody,
            errors: {
                400: `Default response telling whether the request is successful`,
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Delete a student
     * @param requestBody 
     * @returns Result Success
     * @throws ApiError
     */
    public static async deleteStudent(
requestBody: {
/**
 * The unique identifier of the student
 */
student_uid: number,
},
): Promise<Result> {
        const result = await __request({
            method: 'DELETE',
            path: `/student`,
            body: requestBody,
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Validate whether the provided registration key is valid and return corresponding information
     * @param requestBody 
     * @returns any Tell whether the key is valid and return the related information
     * @throws ApiError
     */
    public static async validate(
requestBody: {
registration_key: string,
},
): Promise<(Result & RegistrationKeyInfo)> {
        const result = await __request({
            method: 'POST',
            path: `/validate`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Search for schools
     * @param offset 
     * @param limit 
     * @param schoolName 
     * @param schoolCountry 
     * @param schoolStateProvince 
     * @param city 
     * @returns any Return the schools that satisfy the constraints
     * @throws ApiError
     */
    public static async getSchool(
offset: number,
limit: number = 100,
schoolName?: string,
schoolCountry?: string,
schoolStateProvince?: string,
city?: string,
): Promise<(Result & {
schools?: Array<(School & {
/**
 * The unique identifier of the school
 */
uid: number,
/**
 * The alias that matches the queried school_name
 */
matched_alias?: string,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/school`,
            query: {
                'offset': offset,
                'limit': limit,
                'school_name': schoolName,
                'school_country': schoolCountry,
                'school_state_province': schoolStateProvince,
                'city': city,
            },
        });
        return result.body;
    }

    /**
     * Add a new school
     * @param requestBody 
     * @returns any Successfully added the school and return the id
     * @throws ApiError
     */
    public static async postSchool(
requestBody: (School & {
/**
 * The uid of the city
 */
city_uid?: number,
}),
): Promise<(Result & {
school_uid?: number,
})> {
        const result = await __request({
            method: 'POST',
            path: `/school`,
            body: requestBody,
            errors: {
                400: `Default response telling whether the request is successful`,
            },
        });
        return result.body;
    }

    /**
     * Get the role of the logged in student
     * @returns any Successfully fetched the role
     * @throws ApiError
     */
    public static async getRole(): Promise<(Result & {
role?: Role,
/**
 * The privilege level of the student, the higher the greater
 */
level?: number,
description?: string,
})> {
        const result = await __request({
            method: 'GET',
            path: `/role`,
            errors: {
                401: `Unauthorized to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Get existing cities that match the query params
     * @param offset 
     * @param limit 
     * @param city 
     * @param stateProvince 
     * @param country 
     * @returns any Return a list of cities that match the query params
     * @throws ApiError
     */
    public static async getCity(
offset: number,
limit: number = 100,
city?: string,
stateProvince?: string,
country?: string,
): Promise<(Result & {
cities?: Array<City>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/city`,
            query: {
                'offset': offset,
                'limit': limit,
                'city': city,
                'state_province': stateProvince,
                'country': country,
            },
        });
        return result.body;
    }

    /**
     * Get the registration keys that the current student can access. It is only usable for admin users
     * @param offset 
     * @param limit 
     * @param notExpired When set to true, only registration keys that haven't expired will be returned
     * @returns any Return the information about
     * @throws ApiError
     */
    public static async getRegistrationKey(
offset?: Offset,
limit?: Limit,
notExpired: boolean = true,
): Promise<(Result & {
registration_keys?: Array<(RegistrationKeyInfo & {
registration_key?: string,
/**
 * Whether the registration key is activated or deactivated. This is irrelevant to the expiration date
 */
activated?: boolean,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/registration-key`,
            query: {
                'offset': offset,
                'limit': limit,
                'not_expired': notExpired,
            },
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Add a new registration key
     * @param requestBody If the requestbody is not given, the registration key will be created for the class of the requester
     * @returns any When the registration key is successfully created or rejected due to duplication or invalid class
     * @throws ApiError
     */
    public static async postRegistrationKey(
requestBody?: {
/**
 * The class number for the registration key. If not specified, the class number of the requester is used. Only curriculum, year or system admin can specify class numbers other than their current class number
 */
class_number?: number,
/**
 * The grad year for the registration key. If not specified, the grad year of the requester is used. Only system admin can specify grad year other than their grad year
 */
grad_year?: number,
},
): Promise<(Result & RegistrationKeyInfo & {
/**
 * The registration key you have just created
 */
registration_key?: string,
})> {
        const result = await __request({
            method: 'POST',
            path: `/registration-key`,
            body: requestBody,
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Update the state of the regitration key
     * @param requestBody 
     * @returns Result Success
     * @throws ApiError
     */
    public static async updateRegistrationKey(
requestBody: {
/**
 * The registration key
 */
registration_key?: string,
/**
 * The expiration date is used to identify registration key and it cannot be changed
 */
expiration_date?: string,
/**
 * Whether to activate or deactivate the registration key
 */
activate?: boolean,
},
): Promise<Result> {
        const result = await __request({
            method: 'PUT',
            path: `/registration-key`,
            body: requestBody,
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Get classes that are accessible to the current user.
     * @returns any Return a list of classes
     * @throws ApiError
     */
    public static async getClass(): Promise<(Result & {
classes: Array<Class>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/class`,
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Add a new class. This is only usable for curriculum admins or higher level admins
     * @param requestBody 
     * @returns Result Success
     * @throws ApiError
     */
    public static async postClass(
requestBody: Class,
): Promise<Result> {
        const result = await __request({
            method: 'POST',
            path: `/class`,
            body: requestBody,
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Delete an existing class. This is only usable for curriculum admins or higher level admins
     * @param requestBody 
     * @returns Result Default response telling whether the request is successful
     * @throws ApiError
     */
    public static async deleteClass(
requestBody: {
class_number: number,
grad_year: number,
/**
 * Delete the class anyway even if there are students associated with it. This will delete those students as well
 */
force: boolean,
},
): Promise<Result> {
        const result = await __request({
            method: 'DELETE',
            path: `/class`,
            body: requestBody,
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Query the coordinate of schools
     * @param keywords 
     * @param page 
     * @param city 
     * @param country 
     * @param provider 
     * @returns any Return a list of possible coordinates
     * @throws ApiError
     */
    public static async getLocation(
keywords: string,
page: number = 1,
city?: string,
country?: string,
provider: 'amap' | 'google' = 'amap',
): Promise<(Result & {
locations: Array<(Coordinate & {
name: string,
city?: string,
address?: string,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/location`,
            query: {
                'keywords': keywords,
                'page': page,
                'city': city,
                'country': country,
                'provider': provider,
            },
        });
        return result.body;
    }

    /**
     * Fetch feedbacks as a normal user
     * @returns any Return a list of feedbacks along with associated comments
     * @throws ApiError
     */
    public static async viewGetFeedback(): Promise<(Result & {
feedbacks?: Array<(Feedback & FeedbackInfo & {
/**
 * The unique id of a feedback
 */
feedback_uid: string,
/**
 * The uid of the sender if the feedback was sent by a registered user
 */
sender_uid?: number,
status: 'resolved' | 'pending' | 'closed',
comments: Array<FeedbackComment>,
posted_at: string,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/feedback/view`,
        });
        return result.body;
    }

    /**
     * Fetch feedbacks as an admin
     * @returns any Return a list of feedbacks along with associated comments
     * @throws ApiError
     */
    public static async manageGetFeedback(): Promise<(Result & {
feedbacks?: Array<(Feedback & FeedbackInfo & {
/**
 * The unique id of a feedback
 */
feedback_uid: string,
/**
 * The uid of the sender if the feedback was sent by a registered user
 */
sender_uid?: number,
status: 'resolved' | 'pending' | 'closed',
comments: Array<FeedbackComment>,
posted_at: string,
})>,
})> {
        const result = await __request({
            method: 'GET',
            path: `/feedback/manage`,
        });
        return result.body;
    }

    /**
     * Manage feedbacks
     * @param feedbackUid 
     * @param requestBody 
     * @returns Result Success
     * @throws ApiError
     */
    public static async updateFeedback(
feedbackUid: string,
requestBody: {
status: 'resolved' | 'pending' | 'closed',
},
): Promise<Result> {
        const result = await __request({
            method: 'PUT',
            path: `/feedback/${feedbackUid}/update`,
            body: requestBody,
            errors: {
                401: `Unauthorized to access the resource`,
                403: `The user is not allowed to access the resource`,
            },
        });
        return result.body;
    }

    /**
     * Manage feedbacks
     * @param feedbackUid 
     * @param requestBody 
     * @returns Result Success
     * @throws ApiError
     */
    public static async commentFeedback(
feedbackUid: string,
requestBody: {
/**
 * Whether to reveal the sender name or not
 */
anonymous: boolean,
content?: string,
},
): Promise<Result> {
        const result = await __request({
            method: 'POST',
            path: `/feedback/${feedbackUid}/comment`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Send a new feedback
     * @param requestBody 
     * @returns any Successfully sent the feedback and return its unique id
     * @throws ApiError
     */
    public static async publicReportFeedback(
requestBody: (Feedback & FeedbackInfo),
): Promise<{
/**
 * The unique id of the feedback just created
 */
feedback_uid: string,
}> {
        const result = await __request({
            method: 'POST',
            path: `/feedback/report/public`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Send a new feedback as a logged in user
     * @param requestBody 
     * @returns any Successfully sent the feedback and return its unique id
     * @throws ApiError
     */
    public static async userReportFeedback(
requestBody: Feedback,
): Promise<{
/**
 * The unique id of the feedback just created
 */
feedback_uid?: string,
}> {
        const result = await __request({
            method: 'POST',
            path: `/feedback/report/user`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Logout the current user
     * @returns Result Successfully logged out and removed the current session
     * @throws ApiError
     */
    public static async logout(): Promise<Result> {
        const result = await __request({
            method: 'GET',
            path: `/logout`,
        });
        return result.body;
    }

}