// Update with your config settings.
import fs from "fs";

const password = fs.readFileSync("/run/secrets/pg_password").toString().trim();
console.log(`using password ${password.split("")}`)

module.exports = {

  development: {
    client: "postgresql",
    connection: {
      host: "db-dev",
      database: "development",
      user: "wwgadmin",
      password: password
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      schemaName: "wwg"
    },
    seeds: {
      directory: "./seeds"
    }
  },

  production: {
    client: "postgresql",
    connection: {
      host: "db-prod",
      database: "wwg_base",
      user: "wwgadmin",
      password: password
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    },
    acquireConnectionTimeout: 5000
  }

};
