// Update with your config settings.
import fs from "fs";

module.exports = {

  development: {
    client: "postgresql",
    connection: {
      host: "db",
      database: "development",
      user: "wwgadmin",
      password: fs.readFileSync("/run/secrets/pg_password").toString()
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
      host: "db",
      database: "wwg_base",
      user: "wwgadmin",
      password: "ThePasswordHere"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }

};
