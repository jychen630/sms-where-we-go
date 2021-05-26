/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Student = {
    /**
     * The unique identifier of the student
     */
    uid: number;
    /**
     * The name of the student
     */
    name: string;
    /**
     * The class number of the student at high school
     */
    class_number: number;
    /**
     * The year when the student graduates from high school
     */
    grad_year: string;
    /**
     * The curriculum of the student at high school
     */
    curriculum?: string;
    phone_number?: string;
    email?: string;
    wxid?: string;
    department?: string;
    major?: string;
    school_uid?: number;
}