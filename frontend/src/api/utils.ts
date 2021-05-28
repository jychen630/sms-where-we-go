import { ApiError, Result } from 'wwg-api';

/**
 * A type-safe helper to convert err of `any` type to standard `Result` type
 * @param err 
 * @returns 
 */
export const handleApiError = async (err: ApiError): Promise<Result> => {
    if (!!err.body) {
        return {
            result: err.body.result ?? Result.result.ERROR,
            message: err.body.message ?? 'An unknown error has occurred'
        }
    }
    else {
        console.error(err);
        return {
            result: Result.result.ERROR,
            message: 'An unknown error has occurred'
        }
    }
}