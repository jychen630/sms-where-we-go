import dotenv from "dotenv";

dotenv.config();
console.log(
    `Using db ${
        process.env.NODE_ENV === "production" ? "wwg_base" : "development"
    }.`
);
export const pgOptions = {
    client: "pg",
    connection: {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database:
            process.env.NODE_ENV === "production" ? "wwg_base" : "development",
    },
    searchPath: ["wwg", "public"],
};
