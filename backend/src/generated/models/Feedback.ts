/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The minimal properties that a feedback should contain.
 */
export type Feedback = {
    /**
     * The title of the feedback message
     */
    title: string;
    /**
     * The written body of the feedback message
     */
    content: string;
    /**
     * The reason for sending the feedback
     */
    reason: Feedback.reason;
}

export namespace Feedback {

    /**
     * The reason for sending the feedback
     */
    export enum reason {
        GENERAL = 'general',
        REGISTRATION = 'registration',
        RESET_PASSWORD = 'reset password',
        UPDATE_INFO = 'update info',
        IMPROVEMENT = 'improvement',
    }


}
