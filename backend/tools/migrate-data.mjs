import fs, { exists } from "fs";

import axios from "axios";
import parse from "csv-parse";
import argparse from "argparse";
import { apiBaseUrl } from "./config.mjs";
import { exit } from "process";
import { pg } from "./config.mjs";
import { getLoggerWithExistingParser } from "./tool-config.mjs";

const parser = new argparse.ArgumentParser({
    description: "Load past student data from a csv file",
});

parser.add_argument("input", { nargs: "+" });

parser.add_argument("--classNumberCol", "-c", {
    default: "Class",
});

parser.add_argument("--gradYearCol", "-gc");

parser.add_argument("--gradYear", "-g");

parser.add_argument("--nameCol", "-n", { default: "NameCN" });

parser.add_argument("--mobileCol", "-mo", { default: "Phone" });

parser.add_argument("--ignoreMissing", "-i", {
    action: "store_true",
    default: false,
    help: "Ignore the entry when there is no existing class",
});

parser.add_argument("--bulk", {
    action: "store_true",
    default: false,
    help: "Bulk insert the entries such that any failing entry will rollback the transaction",
});

parser.add_argument("--schoolCol", "-sc", { default: "SchoolLong" });

parser.add_argument("--departmentCol", "-d");

parser.add_argument("--wxidCol", "-wx", { default: "WeChat" });

parser.add_argument("--majorCol", "-m", { default: "MajorCN" });

const logger = getLoggerWithExistingParser(
    parser,
    "migrate-data",
    `log/migrate-${new Date().toJSON().split(":").join("-").slice(0, -1)}.log`
);

let args = parser.parse_args();

if (!!!args.gradYear && !!!args.gradYearCol) {
    parser.error("Either --gradYear or --gradYearCol is required!");
    exit(1);
}

const utils = {
    memo: {},
    async querySchool(name) {
        if (this.memo[name]) {
            return this.memo[name];
        }
        const url = `${apiBaseUrl}/school?school_name=${encodeURI(
            name
        )}&limit=1`;
        return axios
            .get(url)
            .then(
                (result) => {
                    if (result.data.schools && result.data.schools.length > 0) {
                        this.memo.name = result.data.schools[0];
                        return result.data.schools[0];
                    } else {
                        return Promise.reject(
                            `Could not find school matching the name ${name}`
                        );
                    }
                },
                (err) => {
                    this.logError("Query School Error", err);
                    return undefined;
                }
            )
            .catch((error) => {
                this.logError("Query School Error", error);
                return Promise.resolve();
            });
    },
    log(title, msg) {
        logger.info(`\n==========${title}==========${msg ? `\n${msg}:` : ""}`);
    },
    logError(title, msg, err) {
        logger.error(
            `\n==========${title}==========${msg ? `\n${msg}:` : ""}${
                err ? `\n${err}` : ""
            }`
        );
    },
    async addStudent(
        name,
        classNumber,
        gradYear,
        schoolName,
        phoneNum,
        wxid,
        major,
        department,
        bulk
    ) {
        let data = {
            name: name,
            class_number: classNumber,
            grad_year: gradYear,
            phone_number: phoneNum,
            wxid: wxid,
            major: major,
            department: department,
        };

        if (!!schoolName) {
            const school = await utils.querySchool(schoolName);
            if (!!!school) {
                return Promise.reject("School not found");
            }
            data.school_uid = school.uid;
        }

        if (bulk) {
            return data;
        } else {
            return pg("wwg.student")
                .insert(data)
                .then(() => {
                    logger.info(`Inserted ${JSON.stringify(data)}`);
                });
        }
    },
    async flush(data) {
        return pg("wwg.student")
            .insert(data.filter((data) => !!data))
            .then(() => {
                this.log(
                    "Bulk insertion",
                    "Successfully inserted students",
                    JSON.stringify(data)
                );
                return data.length;
            });
    },
};

class Loader {
    constructor(total = 1, step = 1, current = 0, barLength = 20) {
        this.barLength = barLength;
        this.current = current;
        this.total = total;
        this.step = step;
    }
    disable() {
        this.disabled = true;
    }
    progress() {
        return this.current / this.total;
    }
    proceed() {
        if (this.current + this.step >= this.total) {
            this.current = this.total - 1;
        }
        this.current += this.step;
        this.draw();
    }
    add(val) {
        this.current += val;
    }
    set(val) {
        this.current = val;
    }
    addTotal(val) {
        this.total += val;
    }
    setTotal(val) {
        this.total = val;
    }
    draw() {
        if (this.disabled) {
            return;
        }
        const breakPoint = Math.floor(this.progress() * this.barLength);
        process.stdout.write(
            `\r${new Array(this.barLength)
                .fill(0)
                .reduce((s, _, i) => (s += i < breakPoint ? "=" : "·"), "")}(${
                this.current
            }/${this.total})`
        );
    }
}

function migrateData(args) {
    const {
        input,
        classNumberCol,
        gradYearCol,
        gradYear,
        nameCol,
        mobileCol,
        ignoreMissing,
        schoolCol,
        wxidCol,
        majorCol,
        departmentCol,
        silent,
        bulk,
    } = args;
    const loader = new Loader(input.length);
    if (silent !== true) {
        loader.disable();
    }
    let failedFiles = [];

    input.forEach((path) => {
        fs.readFile(path, (err, file) => {
            // Resolve the paths of the data sources
            if (err) {
                utils.logError(path, `Cannot open the file at ${path}`, err);
                failedFiles.push({ path: path, reason: "IO error" });
                loader.proceed();
                return;
            }

            parse(file, { columns: true }, (err, data) => {
                // Parse the csv and do the actual work here
                if (err) {
                    utils.logError(
                        path,
                        `Cannot parse the file at ${path}:`,
                        err
                    );
                    failedFiles.push({ path: path, reason: "Parsing error" });
                    loader.proceed();
                    return;
                }

                let failedEntries = [];
                loader.addTotal(data.length);
                loader.proceed();

                utils.log(path, `${data.length} entries found in ${path}`);

                if (bulk) {
                    loader.addTotal(1);
                }

                Promise.all(
                    data.map(async (student) =>
                        utils
                            .addStudent(
                                student[nameCol],
                                student[classNumberCol],
                                gradYearCol !== undefined
                                    ? student[gradYearCol]
                                    : gradYear,
                                student[schoolCol],
                                student[mobileCol],
                                student[wxidCol],
                                student[majorCol],
                                student[departmentCol],
                                bulk
                            )
                            .then((result) => {
                                loader.proceed();
                                return result;
                            })
                            .catch((reason) => {
                                if (failedEntries.length === 0) {
                                    failedFiles.push({
                                        path: path,
                                        reason: "Entry error",
                                        entries: failedEntries,
                                    });
                                }
                                failedEntries.push({
                                    name: student[nameCol],
                                    reason: reason.toString(),
                                });
                                logger.error(reason.toString());
                                loader.proceed();
                            })
                    )
                ).then((data) => {
                    if (!bulk) {
                        return;
                    }
                    utils
                        .flush(data)
                        .then(() => {
                            loader.proceed();
                        })
                        .catch((reason) => {
                            if (failedEntries.length === 0) {
                                failedFiles.push({
                                    path: path,
                                    reason: "Bulk insertion error",
                                    entries: failedEntries,
                                });
                            }
                            utils.logError(
                                "Bulk insertion",
                                "Bulk insertion failure",
                                reason
                            );
                            failedEntries.push(
                                data.map((student, index) => ({
                                    name: !!student
                                        ? student.name
                                        : `Row ${index}`,
                                    reason: "Bulk insertion failure",
                                }))
                            );
                            loader.proceed();
                        });
                });
            });
        });
    });

    let interval = setInterval(() => {
        if (loader.progress() === 1) {
            loader.draw();
            clearInterval(interval);
            if (failedFiles.length > 0) {
                utils.logError(
                    "Failed files and entries",
                    undefined,
                    JSON.stringify(failedFiles)
                );
                if (silent) {
                    console.error(
                        `\nFailed to migrate data from some files or entries. See the log file for details.\n${JSON.stringify(
                            failedFiles
                        )}`
                    );
                }
                exit(1);
            } else {
                exit(0);
            }
        }
    }, 100);
}

migrateData(args);
