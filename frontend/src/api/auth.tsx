import React, { useContext, useState } from "react";
import { Result, Role, Service } from "wwg-api";
import { handleApiError, HasChildren } from "./utils";

export type LoginHandler = (
    password: string,
    identifier?: number | string,
    useUid?: boolean
) => Promise<Result>;

export interface AuthContext {
    role?: Role;
    studentUid?: number;
    login: LoginHandler;
    devLogin: (uid: number) => Promise<void>;
    logout: () => Promise<void>;
    update: () => Promise<void>;
    gradYear?: number;
    classNumber?: number;
    curriculum?: string;
}

const defaultLoginHandler: LoginHandler = async (password) => ({
    result: Result.result.ERROR,
    message: "Login not available",
});

export const authContext = React.createContext({
    login: defaultLoginHandler,
} as AuthContext);

export const useAuth = () => {
    return useContext(authContext);
};

export const useAuthProvider = () => {
    const [role, setRole] = useState<Role>();
    const [studentUid, setStudentUid] = useState<number>();
    const [gradYear, setGradYear] = useState<number>();
    const [curriculum, setCurriculum] = useState<string>();
    const [classNumber, setClassNumber] = useState<number>();

    const login = async (
        password: string,
        identifier?: number | string,
        useUid: boolean = false
    ) => {
        try {
            const res = await Service.login({
                password: password,
                identifier: identifier as any,
                use_uid: useUid,
            });

            if (res.result === Result.result.SUCCESS) {
                Service.getStudent(true)
                    .then((res) => {
                        if (!!res.students && res.students.length > 0) {
                            setRole(res.students[0].role);
                            setStudentUid(res.students[0].uid);
                            setGradYear(res.students[0].grad_year);
                            setCurriculum(res.students[0].curriculum);
                            setClassNumber(res.students[0].class_number);
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
                return res;
            } else {
                return Promise.reject(res.message);
            }
        } catch (err) {
            return handleApiError(err).then((res) => {
                return Promise.reject(res.message);
            });
        }
    };

    const clear = async () => {
        setRole(undefined);
        setStudentUid(undefined);
        setGradYear(undefined);
        setCurriculum(undefined);
        setClassNumber(undefined);
    };

    const update = async () => {
        return Service.getStudent(true)
            .then((res) => {
                if (!!res.students) {
                    setRole(res.students[0].role);
                    setStudentUid(res.students[0].uid);
                    setGradYear(res.students[0].grad_year);
                    setCurriculum(res.students[0].curriculum);
                    setClassNumber(res.students[0].class_number);
                    return Promise.resolve();
                } else {
                    return Promise.reject();
                }
            })
            .catch((err) => {
                clear();
                return Promise.reject(err);
            });
    };

    const devLogin = async (uid: number): Promise<void> => {
        Service.postDevLogin({ uid: uid }).then((res) => {
            if (res.result === Result.result.SUCCESS) {
                setRole(res.role);
                setStudentUid(uid);
                return Promise.resolve();
            } else {
                return Promise.reject(res.message);
            }
        });
    };

    const logout = async (): Promise<void> => {
        Service.logout()
            .then(() => {
                clear();
            })
            .catch(async (err) => {
                return handleApiError(err).then((res) => {
                    return Promise.reject(res.message);
                });
            });
    };

    return {
        role,
        studentUid,
        login,
        update,
        devLogin,
        classNumber,
        gradYear,
        curriculum,
        logout,
    };
};

export const AuthProvider = ({
    value,
    children,
}: HasChildren<{ value?: AuthContext }>) => {
    const authProvider = useAuthProvider();
    return (
        <authContext.Provider value={value ? value : authProvider}>
            {children}
        </authContext.Provider>
    );
};
