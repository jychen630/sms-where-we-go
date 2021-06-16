import { notification } from 'antd';
import { TFunction } from 'react-i18next';
import React from 'react';
import { ApiError, Result } from 'wwg-api';


type ProcessedError = Result & { requireLogin: boolean };
/**
 * A type-safe helper to convert err of `any` type to standard `Result` type
 * @param err 
 * @returns 
 */
export const handleApiError = async (err: ApiError | string | undefined, cb?: (props: ProcessedError) => void): Promise<ProcessedError> => {
    let requireLogin = false;
    let error = {
        result: Result.result.ERROR,
        message: '发生了未知错误',
        requireLogin: requireLogin
    };
    if (typeof err === 'string') {
        error = {
            result: Result.result.ERROR,
            message: err,
            requireLogin: requireLogin
        };
    }
    else if (err === undefined) {
        error = {
            result: Result.result.ERROR,
            message: '发生了未知错误',
            requireLogin: requireLogin
        };
    }
    else if (err.status === 401) {
        requireLogin = true;
    }

    else if (!!err.body) {
        error = {
            result: err.body.result ?? Result.result.ERROR,
            message: err.body.message ?? '发生了未知错误',
            requireLogin: requireLogin
        };
    }
    cb && cb(error);
    return error;
}

export const createNotifyError = (t?: TFunction<'translation'>, title?: string, errorMsg?: string, cb?: (err: ProcessedError) => void): (props: ProcessedError) => void => {
    /**
     * Create a notify error function that can be used as the callback for handleApiError
     * @param title The title of the notification message
     * @param errorMsg The error message of the notification message
     * @param cb A callback function that takes no argument
     */
    return (props) => {
        notification.error({
            message: title,
            description: <>{errorMsg && <p>{errorMsg}</p>}{props.message && <p>{t ? t(props.message) : props.message}</p>}</>
        });
        cb && cb(props);
    };
}

export type HasChildren<T = {}> = T & { children: React.ReactNode };
// Reference: https://stackoverflow.com/a/49889856/11612399
export type ThenType<T> = T extends PromiseLike<infer U> ? U : T;
