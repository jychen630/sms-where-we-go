import { Operation } from "express-openapi";
import { getLogger } from "log4js";
import { pg } from "..";
import { School } from "../generated/schema";
import { School as apiSchool } from "../generated"
import { Service } from "../generated/services/Service";
import { dbHandleError, parseBody, sendError, sendSuccess } from "../utils";

export const get: Operation = async (req, res) => {
    const data = parseBody<typeof Service.getSchool>(req);
    const logger = getLogger('school.get');

    if ((data !== undefined && data?.limit < 1) || (data !== undefined && data?.offset < 0)) {
        sendError(res, 400, 'Illegal offset or limit');
        logger.error(`Illegal offset or limit. offset: ${data.offset}; limit: ${data.limit}`);
        return;
    }

    pg<School>('school')
        .select()
        .modify<School, School[]>(
            (qb) => {
                if (!!data?.school_name) {
                    qb.where('name', data.school_name);
                }
                if (!!data?.school_country) {
                    qb.where('country', data?.school_country)
                }
                if (!!data?.school_state_province) {
                    qb.where('state_province', data?.school_state_province)
                }
                if (!!data?.city) {
                    qb.where('city', data?.city)
                }
            }
        )
        .limit(data?.limit ?? 1)
        .offset(data?.offset ?? 0)
        .then((result) => {
            const schools = result.map(v => ({
                uid: v.school_uid,
                school_name: v.name,
                school_country: v.country,
                school_state_province: v.state_province,
                city: v.city,
                latitude: (v.position as any).x,
                longitude: (v.position as any).y,
            } as apiSchool));
            logger.info('Successfully fetched schools');
            sendSuccess(res, { schools: schools });
            return;
        })
        .catch((err) => dbHandleError(err, res, logger));
}

export const post: Operation = async (req, res) => {

}