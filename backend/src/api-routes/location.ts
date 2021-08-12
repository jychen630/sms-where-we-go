import { Operation } from "express-openapi";
import { Service } from "../generated";
import { LocationService } from "../services";
import {
    Actions,
    parseQuery,
    sendError,
    sendSuccess,
    ServerLogger,
} from "../utils";

export const get: Operation = (req, res) => {
    const data = parseQuery<typeof Service.getLocation>(req) as any;
    const logger = ServerLogger.getLogger("location.get");
    const visitor = req.session.student_uid ?? "visitor";

    switch (data["provider"]) {
        case "amap":
            LocationService.amap(data["keywords"], data["city"], data["page"])
                .then((result) => {
                    logger.logComposed(
                        visitor,
                        Actions.access,
                        "amap location service",
                        false,
                        undefined,
                        false,
                        data
                    );
                    sendSuccess(res, {
                        locations: result,
                    });
                })
                .catch((err) => {
                    logger.logComposed(
                        visitor,
                        Actions.access,
                        "amap location service",
                        false,
                        err.message,
                        true,
                        { data: data, error: err }
                    );
                    sendError(res, 500, "系统繁忙");
                });
            break;
        case "mapbox":
            LocationService.mapbox(data["keywords"], data["page"])
                .then((result) => {
                    logger.logComposed(
                        visitor,
                        Actions.access,
                        "mapbox location service",
                        false,
                        undefined,
                        false,
                        data
                    );
                    sendSuccess(res, {
                        locations: result,
                    });
                })
                .catch((err) => {
                    logger.logComposed(
                        visitor,
                        Actions.access,
                        "mapbox location service",
                        false,
                        err.message,
                        true,
                        { data: data, error: err }
                    );
                    sendError(res, 500, "系统繁忙");
                });
            break;
    }
};
