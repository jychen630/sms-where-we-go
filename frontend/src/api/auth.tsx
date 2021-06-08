import React, { useContext, useState } from "react";
import { Result, Role, Service } from "wwg-api";
import { handleApiError, HasChildren } from "./utils";

export type LoginHandler = (password: string, identifier?: number | string, useUid?: boolean) => Promise<Result>;

export interface AuthContext {
    role?: Role,
    studentUid?: number,
    login: LoginHandler
}

const defaultLoginHandler: LoginHandler = async (password) => ({ result: Result.result.ERROR, message: 'Login not available' })

export const authContext = React.createContext({
    login: defaultLoginHandler
} as AuthContext);

export const useAuth = () => {
    return useContext(authContext);
}

export const useAuthProvider = () => {
    const [role, setRole] = useState<Role>();
    const [studentUid, setStudentUid] = useState<number>();

    const login = async (password: string, identifier?: number | string, useUid: boolean = false) => {
        try {
            const res = await Service.login({
                password: password,
                identifier: identifier as any,
                use_uid: useUid,
            })

            if (res.result === Result.result.SUCCESS) {
                Service.getStudent(true).then(
                    (res) => {
                        if (!!res.students && res.students.length > 0) {
                            setRole(res.students[0].role);
                            setStudentUid(res.students[0].uid);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    });
                return res;
            }
            else {
                return Promise.reject(res.message);
            }
        }
        catch (err) {
            return handleApiError(err)
                .then((res) => {
                    return Promise.reject(res.message);
                });
        }
    }

    const update = async () => {
        Service.getStudent(true)
            .then(res => {
                if (!!res.students) {
                    setRole(res.students[0].role);
                    setStudentUid(res.students[0].uid);
                }
                else {
                    return Promise.reject();
                }
            })
            .catch(err => {
                setRole(undefined);
                setStudentUid(undefined);
            });
    }

    return { role, studentUid, login, update };
}

export const AuthProvider = ({ value, children }: HasChildren<{ value?: AuthContext }>) => {
    const authProvider = useAuthProvider();
    return (
        <authContext.Provider value={value ? value : authProvider}>{children}</authContext.Provider>
    )
}


