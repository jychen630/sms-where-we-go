// Update with your config settings.

module.exports = {

  development: {
    client: "postgresql",
    connection: {
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

  staging: {
    client: "postgresql",
    connection: {
      database: "development",
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
  },

  production: {
    client: "postgresql",
    connection: {
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
