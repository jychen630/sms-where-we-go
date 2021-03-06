import fs from "fs";
import log4js from "log4js";
import { assert } from "console";
import { pg } from "./load.mjs";
import axios from "axios";

const logger = log4js.getLogger("LoadSchool");

// SQL error code when the values to be inserted violate any unique constraints
const UNIQUE_CONSTRAINT_CODE = "23505";
/**
 * Take data from JSON files and load them into the database
 * The expected structure of the JSON file should be:
 *
 * {
 *  "country": "the name of the country",
 *  "data": [
 *    {
 *      "state_province": "the state or the province",
 *      "schools": [
 *        {
 *          "name": "the name of the school",
 *          "city": "the name of the city",
 *          "lat": 12.00,
 *          "long": 34.00
 *        }
 *      ]
 *    }
 *  ]
 * }
 * where “lat", "long" are optional.
 *
 * state_province can be absent in case it doesn't apply,
 * but it should be included when there is an equivalent.
 * It supports incremental addition of cities, schools, and school aliases
 *
 * @param paths The paths to files that store the school data in JSON format
 */
export default async function initSchools(paths) {
    let cities = {};
    try {
        for (let m = 0; m < paths.length; m++) {
            logger.info(`Reading from ${paths[m]}`);
            let parsed = JSON.parse(fs.readFileSync(paths[m]));
            const country = parsed.country;

            for (let i = 0, len = parsed.data.length; i < len; i++) {
                // Iterate through the list of schools within the state or province
                const stateProvince = parsed.data[i].state_province;

                for (
                    let n = 0, len = parsed.data[i].schools.length;
                    n < len;
                    n++
                ) {
                    const school = parsed.data[i].schools[n];
                    const key = `${school.city.toLowerCase()} ${stateProvince.toLowerCase()} ${country.toLowerCase()}`;

                    // Presumably, the combination of city and state_pronvince is unique in the database
                    // We use it as an unique identifier for any city that has been added
                    if (cities[key] === undefined) {
                        cities[key] = await addOrRetrieveCity(
                            school.city,
                            stateProvince,
                            country
                        );
                    }

                    assert(cities[key] !== undefined);

                    let [lat, lng] = [school.latitude, school.longitude];
                    if (!!!school.latitude || !!!school.longitude) {
                        try {
                            [lng, lat] = await getSchoolLngLat(
                                school.name,
                                school.city,
                                country
                            );
                            logger.info(`Retreived ${lng} ${lat}`);
                        } catch (err) {
                            logger.error("Cannot retrieve the location of");
                            logger.error(school);
                            logger.error(`Error message: ${err.message}`);
                            continue;
                        }
                    }

                    // Having either inserted or retrieved the city, we can use the cities[key] to add the school
                    const schoolUid = await addOrRetrieveSchool(
                        school.name,
                        cities[key],
                        lat,
                        lng,
                        !!school.aliases,
                        true
                    );

                    if (!!school.aliases) {
                        await addSchoolAliases(schoolUid, school.aliases);
                    }
                }
            }
        }
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
}

async function addOrRetrieveCity(
    city,
    stateProvince,
    country,
    retrieve = true
) {
    // Insert the new city if it doesn't exist
    let cityUid = undefined;
    const displayName = `${city} ${stateProvince} ${country}`;
    try {
        const result = await pg("wwg.city").insert(
            {
                city: city,
                state_province: stateProvince,
                country: country,
            },
            "city_uid"
        );
        cityUid = result[0];
        logger.debug(`Added city "${displayName}"`);
    } catch (err) {
        if (err.code === UNIQUE_CONSTRAINT_CODE) {
            if (!retrieve) {
                logger.debug(
                    `Not retrieving duplicate "${displayName}" as we have no further plans for it`
                );
                return cityUid;
            }
            // If the city already exists, we retrieve it from the db
            const result = await pg("wwg.city")
                .column("city_uid")
                .select()
                .where({
                    city: city,
                    state_province: stateProvince,
                    country: country,
                });
            cityUid = result[0].city_uid;
            logger.debug(`Retrieved city "${displayName}"`);
        } else {
            // If not, we consider the error fatal and exit
            logger.fatal(`Failed to add city: "${displayName}"`);
            logger.fatal(err);
            process.exit(1);
        }
    }
    return cityUid;
}

async function addOrRetrieveSchool(
    name,
    cityUid,
    lat,
    lng,
    retrieve = true,
    override = false
) {
    let schoolUid = undefined;
    try {
        const result = await pg("wwg.school").insert(
            {
                name: name,
                city_uid: cityUid,
                latitude: lat,
                longitude: lng,
            },
            "school_uid"
        );
        schoolUid = result[0];
        logger.debug(`Added school "${name}"`);
    } catch (err) {
        if (err.code === UNIQUE_CONSTRAINT_CODE) {
            // If the school already exists and we are going to insert aliases for it, we retrieve it from the db
            if (retrieve) {
                const result = await pg("wwg.school")
                    .column("school_uid")
                    .select()
                    .where({
                        name: name,
                        city_uid: cityUid,
                    });
                schoolUid = result[0].school_uid;
                logger.debug(
                    `Retrieved school "${name}" (city_uid: ${cityUid})`
                );
            }

            if (override && !!name && !!cityUid) {
                try {
                    await pg("wwg.school")
                        .update({
                            latitude: lat,
                            longitude: lng,
                        })
                        .where({
                            name: name,
                            city_uid: cityUid,
                        });
                    logger.debug(
                        `Updated school coordinate ${lat}, ${lng} for ${name} at city ${cityUid}`
                    );
                } catch (err) {
                    logger.error(
                        `Failed to update coordinate of ${name} at city ${cityUid} to ${lat}, ${lng}`
                    );
                    logger.error(err.message);
                }
            }
        } else {
            // If not, we consider the error fatal and exit the script
            logger.fatal(
                `Failed to add school: "${name}" (city_uid: ${cityUid})`
            );
            logger.fatal(err);
            process.exit(1);
        }
    }
    return schoolUid;
}

async function addSchoolAliases(schoolUid, aliases) {
    for (let k = 0, len = aliases.length; k < len; k++) {
        const alias = aliases[k];
        try {
            await pg("school_alias").insert({
                school_uid: schoolUid,
                alias: alias,
            });
            logger.debug(`Added alias "${alias}" for ${schoolUid}`);
        } catch (err) {
            if (err.code === UNIQUE_CONSTRAINT_CODE) {
                logger.warn(
                    `The alias "${alias}" already exists on ${schoolUid}`
                );
            } else {
                logger.fatal(
                    `Failed to add alias: "${alias}" (school_uid: ${schoolUid})`
                );
                logger.fatal(err);
                process.exit(1);
            }
        }
    }
}
async function getSchoolLngLat(name, city, country) {
    const result = await axios.get(
        `http://localhost:8080/v1/location?keywords=${encodeURIComponent(
            name
        )}&page=1&provider=amap`
    );
    return [
        result.data.locations[0].longitude,
        result.data.locations[0].latitude,
    ];
}
