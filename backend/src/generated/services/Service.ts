/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { City } from '../models/City';
import type { Result } from '../models/Result';
import type { Role } from '../models/Role';
import type { School } from '../models/School';
import type { Student } from '../models/Student';
import type { StudentVerbose } from '../models/StudentVerbose';
import type { Visibility } from '../models/Visibility';
import { request as __request } from '../core/request';

export class Service {

    /**
     * Return a roster containing the students and schools information
     * @returns any Sucessfully retrieved the roster
     * @returns Result Default response telling whether the request is successful
     * @throws ApiError
     */
    public static async getRoster(): Promise<(Result & {
students: Array<(Student & StudentVerbose)>,
schools: Array<(School & {
/**
 * The unique identifier of the school
 */
uid?: number,
})>,
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
): Promise<(Result & {
students?: Array<(Student & StudentVerbose)>,
})> {
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
name: string,
password: string,
curriculum?: any,
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
): Promise<(Result & {
class_number?: number,
grad_year?: number,
curriculum?: string,
expiration_date?: string,
})> {
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

}