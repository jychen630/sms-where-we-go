/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Result } from '../models/Result';
import type { School } from '../models/School';
import type { Student } from '../models/Student';
import { request as __request } from '../core/request';

export class Service {

    /**
     * Return a roster containing the students and schools information
     * @returns any Sucessfully retrieve the roster
     * @returns Result Default response telling whether the request is successful
     * @throws ApiError
     */
    public static async getRoster(): Promise<{
students: Array<Student>,
schools: Array<School>,
} | Result> {
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
 * The identifier of the username, which can be the UID, phone number or email
 */
identifier: string,
password: string,
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
     * Register for a new student
     * @param requestBody 
     * @returns Result Success
     * @throws ApiError
     */
    public static async register(
requestBody: {
/**
 * The name of the student
 */
name: string,
/**
 * The registration key provided by the maintainer for each class which fills class_number, year, and curriculum for the student
 */
registration_key?: string,
phone_number?: string,
email?: string,
wxid?: string,
department?: string,
major?: string,
school_UID?: number,
},
): Promise<Result> {
        const result = await __request({
            method: 'POST',
            path: `/register`,
            body: requestBody,
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
}) | Result> {
        const result = await __request({
            method: 'POST',
            path: `/validate`,
            body: requestBody,
        });
        return result.body;
    }

}