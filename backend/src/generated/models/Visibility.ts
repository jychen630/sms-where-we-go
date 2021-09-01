/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * * `private`: Visible only to the student themself * `class`: Visible only to the students in the same class * `curriculum`: Visible only to the students within the same curriculum * `year`: Visible only to the students who graduate in the same year * `students`: Visible only to any registered users (including past and future students)
 * 
 */
export enum Visibility {
    PRIVATE = 'private',
    CLASS = 'class',
    CURRICULUM = 'curriculum',
    YEAR = 'year',
    STUDENTS = 'students',
}