// Update with your config settings.

module.exports = {

  development: {
    client: "postgresql",
    connection: {
      host: "db",
      database: "development",
      user: "wwgadmin",
      password: "ThePasswordHere"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      schemaName: "wwg"
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
