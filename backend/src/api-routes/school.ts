import { Operation } from "express-openapi";
import { getLogger } from "log4js";
import { pg } from "..";
import { City, School, SchoolAlias } from "../generated/schema";
import { School as apiSchool } from "../generated";
import { Service } from "../generated/services/Service";
import {
  dbHandleError,
  parseBody,
  parseQuery,
  sendError,
  sendSuccess,
} from "../utils";

export const get: Operation = async (req, res) => {
  const data = parseQuery<typeof Service.getSchool>(req) as any;
  const logger = getLogger("school.get");

  if (
    (data !== undefined && data?.limit < 1) ||
    (data !== undefined && data?.offset < 0)
  ) {
    sendError(res, 400, "Illegal offset or limit");
    logger.error(
      `Illegal offset or limit. offset: ${data.offset}; limit: ${data.limit}`
    );
    return;
  }

  if (
    data === undefined ||
    (!!!data.school_name &&
      !!!data.school_country &&
      !!!data.school_state_province &&
      !!!data.city)
  ) {
    sendSuccess(res, { schools: [] });
    return;
  }

  const subquery = pg("school")
    .column(
      { uid: "school.school_uid" },
      "name",
      "country",
      "state_province",
      "city",
      "latitude",
      "longitude",
      "alias",
      pg.raw("SIMILARITY(school_alias.alias, ?) as s", data.school_name ?? "")
    )
    .select()
    .leftJoin("school_alias", "school_alias.school_uid", "school.school_uid")
    .joinRaw("NATURAL JOIN city")
    .modify<School & City & SchoolAlias, (School & City & SchoolAlias)[]>(
      async (qb) => {
        if (!!data?.school_name) {
          qb.orderByRaw(
            "SIMILARITY(school_alias.alias, ?) DESC",
            data.school_name
          );
          qb.whereRaw(
            "SIMILARITY(school_alias.alias, ?) > 0.2",
            data.school_name
          );
        }
        if (!!data?.school_country) {
          qb.where("country", data?.school_country);
        }
        if (!!data?.school_state_province) {
          qb.where("state_province", data?.school_state_province);
        }
        if (!!data?.city) {
          qb.where("city", data?.city);
        }
      }
    )
    .as("t1");
  pg(subquery)
    .select()
    .distinctOn("uid")
    .limit(data?.limit ?? 1)
    .offset(data?.offset ?? 0)
    .orderBy("uid")
    .orderBy("s", "desc")
    .then((result) => {
      const schools = result.map(
        (v) =>
          ({
            uid: v.uid,
            school_name: v.name,
            school_country: v.country,
            school_state_province: v.state_province,
            city: v.city,
            latitude: v.latitude,
            longitude: v.longitude,
            matched_alias: data.school_name ? v.alias : undefined,
          } as apiSchool)
      );
      logger.info("Successfully fetched schools");
      sendSuccess(res, { schools: schools });
      return;
    })
    .catch((err) => dbHandleError(err, res, logger));
};

export const post: Operation = async (req, res) => {
  const data = parseBody<typeof Service.postSchool>(req);
  const logger = getLogger("school.post");

  if (!!!data.city_uid) {
    pg("city")
      .insert(
        {
          city: data.city,
          country: data.school_country,
          state_province: data.school_state_province,
        },
        "city_uid"
      )
      .then((result) =>
        pg("school")
          .insert(
            {
              city_uid: result[0],
              name: data.school_name,
              longitude: data.longitude,
              latitude: data.latitude,
            },
            "school_uid"
          )
          .then((result) =>
            sendSuccess(res, {
              school_uid: result[0],
            })
          )
      )
      .catch((err) => dbHandleError(err, res, logger));
  } else {
    pg("school")
      .insert(
        {
          city_uid: data.city_uid,
          name: data.school_name,
          longitude: data.longitude,
          latitude: data.latitude,
        },
        "school_uid"
      )
      .then((result) => sendSuccess(res, { school_uid: result[0] }))
      .catch((err) => dbHandleError(err, res, logger));
  }
};
