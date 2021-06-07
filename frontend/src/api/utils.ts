import React from 'react';
import { ApiError, Result } from 'wwg-api';

/**
 * A type-safe helper to convert err of `any` type to standard `Result` type
 * @param err 
 * @returns 
 */
export const handleApiError = async (err: ApiError | string | undefined): Promise<Result & { requireLogin: boolean }> => {
    let requireLogin = false;
    if (typeof err === 'string') {
        return {
            result: Result.result.ERROR,
            message: err,
            requireLogin: requireLogin
        };
    }

    if (err === undefined) {
        return {
            result: Result.result.ERROR,
            message: '发生了未知错误',
            requireLogin: requireLogin
        };
    }

    if (err.status === 401) {
        requireLogin = true;
    }

    if (!!err.body) {
        return {
            result: err.body.result ?? Result.result.ERROR,
            message: err.body.message ?? '发生了未知错误',
            requireLogin: requireLogin
        };
    }
    else {
        console.error(err);
        return {
            result: Result.result.ERROR,
            message: '发生了未知错误',
            requireLogin: requireLogin
        }
    }
}

export type HasChildren<T = {}> = T & { children: React.ReactNode };
// Reference: https://stackoverflow.com/a/49889856/11612399
export type ThenType<T> = T extends PromiseLike<infer U> ? U : T;
