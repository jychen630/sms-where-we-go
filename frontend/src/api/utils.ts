import { ApiError, Result } from 'wwg-api';

/**
 * A type-safe helper to convert err of `any` type to standard `Result` type
 * @param err 
 * @returns 
 */
export const handleApiError = async (err: ApiError | string | undefined): Promise<Result> => {
    if (typeof err === 'string') {
        return {
            result: Result.result.ERROR,
            message: err
        };
    }

    if (err === undefined) {
        return {
            result: Result.result.ERROR,
            message: '发生了未知错误'
        };
    }

    if (!!err.body) {
        return {
            result: err.body.result ?? Result.result.ERROR,
            message: err.body.message ?? '发生了未知错误'
        };
    }
    else {
        console.error(err);
        return {
            result: Result.result.ERROR,
            message: '发生了未知错误'
        }
    }
}
// Reference: https://stackoverflow.com/a/49889856/11612399
export type ThenType<T> = T extends PromiseLike<infer U> ? U : T;
