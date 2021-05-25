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
        UID: number
        name: string
        class_number: number
        grad_year: string
        curriculum: string
        phone_number: string
        email: string
        wxid: string
        department: string
        major: string
        school_UID: number
    }
}

export default schemas;
