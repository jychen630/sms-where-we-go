/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Result = {
    result: Result.result;
    message: string;
}

export namespace Result {

    export enum result {
        SUCCESS = 'success',
        ERROR = 'error',
    }


}
