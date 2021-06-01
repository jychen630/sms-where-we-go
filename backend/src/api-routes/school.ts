import { Operation } from "express-openapi";
import { getLogger } from "log4js";
import { pg } from "..";
import { City, School, SchoolAlias } from "../generated/schema";
import { School as apiSchool } from "../generated"
import { Service } from "../generated/services/Service";
import { dbHandleError, parseQuery, sendError, sendSuccess } from "../utils";

export const get: Operation = async (req, res) => {
    const data = parseQuery<typeof Service.getSchool>(req) as any;
    const logger = getLogger('school.get');

    if ((data !== undefined && data?.limit < 1) || (data !== undefined && data?.offset < 0)) {
        sendError(res, 400, 'Illegal offset or limit');
        logger.error(`Illegal offset or limit. offset: ${data.offset}; limit: ${data.limit}`);
        return;
    }

    const subquery = pg('school')
        .column('school.school_uid')
        .select()
        .leftJoin('school_alias', 'school_alias.school_uid', 'school.school_uid')
        .joinRaw('NATURAL JOIN city')
        .modify<School & City & SchoolAlias, (School & City & SchoolAlias)[]>(
            async (qb) => {
                console.log(data.school_name);
                if (!!data?.school_name) {
                    qb.orderByRaw('school_alias.alias \% ? DESC', data.school_name);
                    qb.whereRaw('SIMILARITY(school_alias.alias, ?) > 0.2', data.school_name);
                }
                if (!!data?.school_country) {
                    qb.where('country', data?.school_country);
                }
                if (!!data?.school_state_province) {
                    qb.where('state_province', data?.school_state_province);
                }
                if (!!data?.city) {
                    qb.where('city', data?.city);
                }
            }
        );
    pg('school')
        .where('school_uid', 'in', subquery)
        .limit(data?.limit ?? 1)
        .offset(data?.offset ?? 0)
        .then((result) => {
            const schools = result.map(v => ({
                uid: v.school_uid,
                school_name: v.name,
                school_country: v.country,
                school_state_province: v.state_province,
                city: v.city,
                latitude: v.latitude,
                longitude: v.longitude,
                alias: v.alias
            } as apiSchool));
            logger.info('Successfully fetched schools');
            sendSuccess(res, { schools: schools });
            return;
        })
        .catch((err) => dbHandleError(err, res, logger));
}

export const post: Operation = async (req, res) => {

}