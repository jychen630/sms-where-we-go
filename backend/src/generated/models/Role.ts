/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * * `student` Limited write access to the user itself * `class` Write access to the students within a class * `curriculum` Write access to the student within a curriculum * `year` Write access to the students who graduate in the same year * `system` Write access to the all students including admin students
 * 
 */
export enum Role {
    STUDENT = 'student',
    CLASS = 'class',
    CURRICULUM = 'curriculum',
    YEAR = 'year',
    SYSTEM = 'system',
}