/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Metadata of a posted feedback.
 */
export type FeedbackMeta = {
    /**
     * The unique id of a feedback
     */
    feedback_uid: string;
    /**
     * The uid of the sender if the feedback was sent by a registered user
     */
    sender_uid?: number;
    status: FeedbackMeta.status;
    posted_at: string;
}

export namespace FeedbackMeta {

    export enum status {
        RESOLVED = 'resolved',
        PENDING = 'pending',
        CLOSED = 'closed',
    }


}
