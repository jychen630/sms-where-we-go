import dotenv from "dotenv";
import knex from "knex";

export const apiBaseUrl = "http://localhost:8080/v1";

dotenv.config();
export const pg = knex.knex({
    client: "pg",
    connection: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: "wwg_base",
    },
    searchPath: ["wwg", "public"],
});
