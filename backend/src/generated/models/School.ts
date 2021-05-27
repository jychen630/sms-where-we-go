/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type School = {
    /**
     * The unique identifier of the school
     */
    uid: number;
    latitude?: number;
    longitude?: number;
    school_name: string;
    school_country?: string;
    school_state_province?: string;
    city?: string;
}