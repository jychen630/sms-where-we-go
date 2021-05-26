/// <reference types="node" />

import { Session } from 'express-session';

declare module 'express-session' {
    interface Session {
        student_uid: number,
        identifier: string
    }
}

declare namespace schemas {
    interface Student {
        uid: number
        name: string
        class_number: number
        grad_year: string
        curriculum: string
        phone_number: string
        email: string
        wxid: string
        department: string
        major: string
        school_uid: number
    }
}

export default schemas;
