import dotenv from 'dotenv';

dotenv.config();
export const pgOptions = {
    client: 'pg',
    connection: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: 'wwg_base'
    },
    searchPath: ['wwg', 'public'],
};