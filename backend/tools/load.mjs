import knex from "knex";
import dotenv from "dotenv";
import log4js from "log4js";
import knexTypes from "knex-types";
import initSchools from "./load-school.mjs";

import argparse from "argparse";

const parser = new argparse.ArgumentParser({
  description: "Load or incrementally add initial data to the database",
});
// ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, MARK, OFF
let level = "warn";
parser.add_argument("-f", "--force", {
  action: "store_true",
  help: "Reset the database before loading the data",
});
let group = parser.add_mutually_exclusive_group();
group.add_argument("-v", "--verbose", {
  action: "store_true",
  help: "Show verbose console output",
});
group.add_argument("-s", "--silent", {
  action: "store_true",
  help: "Do not show any output",
});
const args = parser.parse_args();

log4js.configure({
  appenders: {
    console: { type: "console" },
    file: {
      type: "file",
      filename: `log/load-${new Date()
        .toJSON()
        .split(":")
        .join("-")
        .slice(0, -1)}.log`,
    },
  },
  categories: {
    default: {
      appenders: args.silent ? ["console"] : ["console", "file"],
      level: args.verbose ? "all" : args.silent ? "off" : "info",
    },
  },
});

const logger = log4js.getLogger("load");

const RETRIES = 5;
const DATA_PATHS = ["./tools/ChinaUniversityList.json", "./tools/test.json"];
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

function handleError(err) {
  if (!!err.detail) {
    logger.error(err.detail);
  } else {
    logger.error(err);
  }
}

async function populateTestData() {
  logger.info("Populating test data for curriculum...");
  await pg("wwg.curriculum")
    .insert([
      {
        curriculum_name: "international",
      },
      {
        curriculum_name: "gaokao",
      },
    ])
    .catch(handleError);

  logger.info("Populating test data for class...");
  await pg("wwg.class")
    .insert([
      {
        class_number: 2,
        grad_year: 2019,
        curriculum_name: "gaokao",
      },
      {
        class_number: 3,
        grad_year: 2019,
        curriculum_name: "gaokao",
      },
      {
        class_number: 2,
        grad_year: 2020,
        curriculum_name: "gaokao",
      },
      {
        class_number: 4,
        grad_year: 2019,
        curriculum_name: "international",
      },
      {
        class_number: 5,
        grad_year: 2019,
        curriculum_name: "international",
      },
    ])
    .catch(handleError);

  logger.info("Populating test data for student...");
  await pg("wwg.student")
    .insert([
      {
        name: "Ming",
        phone_number: "18923232323",
        password_hash:
          "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2019,
        school_uid: 1,
      },
      {
        name: "Dan",
        phone_number: "13988889999",
        password_hash:
          "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: "class",
        role: "class",
      },
      {
        name: "Kang",
        phone_number: "13634343434",
        password_hash:
          "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2020,
        school_uid: 1,
        visibility_type: "curriculum",
      },
      {
        name: "Wang",
        phone_number: "18612344321",
        password_hash:
          "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 2,
        grad_year: 2020,
        school_uid: 1,
        visibility_type: "curriculum",
        role: "system",
      },
      {
        name: "Fang",
        phone_number: "13900002222",
        password_hash:
          "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 3,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: "private",
      },
      {
        name: "Zheng",
        phone_number: "13900006666",
        password_hash:
          "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 4,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: "curriculum",
        role: "curriculum",
      },
      {
        name: "Gao",
        phone_number: "18912346666",
        password_hash:
          "$2b$10$5uAd2PJztsBwdXoYsMeo2e5kUJ7kC5XLxV5URwbpagP3ibVUjnNyK",
        class_number: 5,
        grad_year: 2019,
        school_uid: 1,
        visibility_type: "curriculum",
        role: "year",
      },
    ])
    .catch(handleError);

  logger.info("Populating test data for registration key...");
  await pg("wwg.registration_key")
    .insert({
      registration_key: "202106wwgasdfg",
      expiration_date: new Date("2022").toISOString(),
      class_number: 2,
      grad_year: 2019,
    })
    .catch(handleError);
}

async function setup() {
  logger.info("Setting up knex using environmental variables...");

  async function pingPg(retries = RETRIES) {
    if (retries == 0) {
      logger.error(`Exceeded maximum retries of ${RETRIES}. Quitting`);
      process.exit(1);
    }
    logger.info("Pinging postgresql...");
    return new Promise((resolve) => {
      setTimeout(async () => {
        await pg("wwg.school")
          .select()
          .then(() => {
            logger.info("OK");
            resolve();
            return Promise.resolve();
          })
          .catch(async (err) => {
            await pingPg(retries - 1, err);
            logger.error(err);
            logger.error("Failed to connect to postgre, retry in 3 seconds");
          });
        resolve();
      });
    });
  }

  await pingPg();

  logger.info(`Generating school data from ${DATA_PATHS.join(", ")}}`);
  await initSchools(DATA_PATHS);

  logger.info("Populating test data...");
  await populateTestData();

  logger.info("Generating types from database schema");
  const output = "./src/generated/schema.ts";
  await knexTypes.updateTypes(pg, { output: output }).catch((err) => {
    logger.error(err);
    logger.error("Failed to generate the types");
  });
}

setup();
