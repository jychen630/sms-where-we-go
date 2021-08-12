import { Session } from "express-session";

declare module "express-session" {
    interface Session {
        student_uid: number;
        identifier: string | number;
    }
}

export type ArrayType<T> = T extends Array<infer U> ? U : never;
