/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Result } from '../models/Result';
import type { Role } from '../models/Role';
import type { School } from '../models/School';
import type { Student } from '../models/Student';
import type { Visibility } from '../models/Visibility';
import { request as __request } from '../core/request';

export class Service {

    /**
     * Return a roster containing the students and schools information
     * @returns any Sucessfully retrieve the roster
     * @returns Result Default response telling whether the request is successful
     * @throws ApiError
     */
    public static async getRoster(): Promise<(Result & {
students: Array<(Student & {
/**
 * The unique identifier of the student
 */
uid: number,
})>,
schools: Array<School>,
}) | Result> {
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
requestBody: {
/**
 * The identifier of the username, which can be the uid, phone number or email
 */
identifier: string,
password: string,
/**
 * When set to true, the identifier will be used as the uid of the student
 */
use_uid?: boolean,
},
): Promise<Result> {
        const result = await __request({
            method: 'POST',
            path: `/login`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Return the information of students. Result is scoped by visibility.
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
name?: string,
phoneNumber?: string,
curriculum?: string,
city?: string,
schoolStateProvince?: string,
schoolCountry?: string,
): Promise<Array<(Student & {
/**
 * The unique identifier of the student
 */
uid: number,
})>> {
        const result = await __request({
            method: 'GET',
            path: `/student`,
            query: {
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
password: string,
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
     * @returns Result Default response telling whether the request is successful
     * @throws ApiError
     */
    public static async validate(
requestBody: {
registration_key: string,
},
): Promise<(Result & {
class_number?: number,
year?: string,
curriculum?: string,
expiration_date?: string,
}) | Result> {
        const result = await __request({
            method: 'POST',
            path: `/validate`,
            body: requestBody,
        });
        return result.body;
    }

    /**
     * Search for schools
     * @param requestBody 
     * @returns School Return the schools that satisfy the constraints
     * @throws ApiError
     */
    public static async getSchool(
requestBody?: {
school_name?: string,
school_country?: string,
school_state_province?: string,
city?: string,
limit: number,
},
): Promise<Array<School>> {
        const result = await __request({
            method: 'GET',
            path: `/school`,
            body: requestBody,
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
requestBody: School,
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
role?: string,
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

}