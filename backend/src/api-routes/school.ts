import { Operation } from "express-openapi";
import { pg } from "..";
import { City, School, SchoolAlias } from "../generated/schema";
import { School as apiSchool } from "../generated";
import { Service } from "../generated/services/Service";
import {
  Actions,
  dbHandleError,
  getSelf,
  parseBody,
  parseQuery,
  sendError,
  sendSuccess,
  ServerLogger,
  validateAdmin,
  validateLogin,
} from "../utils";

export const get: Operation = async (req, res) => {
  const data = parseQuery<typeof Service.getSchool>(req) as any;
  const logger = ServerLogger.getLogger("school.get");

  if (
    (data !== undefined && data?.limit < 1) ||
    (data !== undefined && data?.offset < 0)
  ) {
    sendError(res, 400, "Illegal offset or limit");
    logger.logComposed(
      req.session.student_uid ?? 'Visitor',
      Actions.access,
      'schools',
      false,
      'illegal offset or limit was given',
      true,
      data
    )
    return;
  }

  if (
    data === undefined ||
    (!!!data.school_name &&
      !!!data.school_country &&
      !!!data.school_state_province &&
      !!!data.city &&
      !!!data.limit)
  ) {
    sendSuccess(res, { schools: [] });
    logger.logComposed(
      req.session.student_uid ?? 'Visitor',
      Actions.access,
      'schools',
      false,
      'no filters were applied',
      false,
      data
    )
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
    .distinctOn('uid')
    .select()
    .leftJoin("school_alias", "school_alias.school_uid", "school.school_uid")
    .joinRaw("NATURAL JOIN city")
    .modify<School & City & SchoolAlias, (School & City & SchoolAlias)[]>(
      async (qb) => {
        if (!!data?.school_name) {
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
    .limit(data?.limit ?? 1)
    .offset(data?.offset ?? 0)
    .orderBy("s", "desc")
    .orderBy("uid")
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

      logger.logComposed(
        req.session.student_uid ?? 'Visitor',
        Actions.access,
        'schools',
        false,
        undefined,
        false,
        data
      )
      sendSuccess(res, { schools: schools });
      return;
    })
    .catch((err) => dbHandleError(err, res, logger.logger));
};

export const post: Operation = async (req, res) => {
  const data = parseBody<typeof Service.postSchool>(req);
  const logger = ServerLogger.getLogger("school.post");

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
          .then((result) => {
            sendSuccess(res, {
              school_uid: result[0],
            });
            logger.logComposed(
              req.session.student_uid ?? 'Visitor',
              Actions.create,
              'a school with a new city',
              false,
              undefined,
              false,
              data,
            )
          })
      )
      .catch((err) => dbHandleError(err, res, logger.logger));
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
      .then((result) => {
        sendSuccess(res, { school_uid: result[0] });
        logger.logComposed(
          req.session.student_uid ?? 'Visitor',
          Actions.create,
          'a school',
          false,
          undefined,
          false,
          data,
        )
      })
      .catch((err) => dbHandleError(err, res, logger.logger));
  }
};

export const DELETE: Operation = (req, res) => {
  const data = parseBody<typeof Service.deleteSchool>(req);
  const logger = ServerLogger.getLogger("school.post");
  sendSuccess(res)

  if (!validateLogin(req, res, logger)) return;

  getSelf(req, res, logger).then(self => {
    if (!validateAdmin(res, self, logger)) return;

    pg
      .delete()
      .where("school_uid", data.school_uid)
      .then(result => {
        if (result === 0) {
          logger.logComposed(self, Actions.delete, `school ${data.school_uid}`, false, "no school is affected", true);
          sendError(res, 200, "No school is deleted");
        }
        else {
          logger.logComposed(self, Actions.delete, `school ${data.school_uid}`);
          sendSuccess(res);
        }
      })
      .catch(err => dbHandleError(err, res, logger.logger));
  })
}
