import { Operation } from "express-openapi";
import { getLogger } from "log4js";
import { pg } from "..";
import { Service } from "../generated";
import { dbHandleError, parseQuery, sendSuccess } from "../utils";

export const get: Operation = async (req, res) => {
    const data = parseQuery<typeof Service.getCity>(req) as any;
    const logger = getLogger("city.get");

    const subquery = pg("city")
        .column(
            "city_uid",
            "city",
            "state_province",
            "country",
            pg.raw("SIMILARITY(city.city, ?) as s", data.city ?? "")
        )
        .select()
        .as("t1")
    pg(subquery)
        .select()
        .where("s", '>', 0.2)
        .orderBy("s")
        .limit(data?.limit ?? 1)
        .offset(data?.offset ?? 0)
        .then((result) => {
            logger.info("Successfully fetched cities");
            sendSuccess(res, {
                cities: result.map((value) => ({
                    city_uid: value.city_uid,
                    city: value.city,
                    state_province: value.state_province,
                    country: value.country,
                }))
            });
        })
        .catch((err) => dbHandleError(err, res, logger))
}
