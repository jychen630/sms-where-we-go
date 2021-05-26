/// <reference types="node" />

import { Session } from 'express-session';

declare module 'express-session' {
    interface Session {
        student_uid: number,
        identifier: string
    }
}
