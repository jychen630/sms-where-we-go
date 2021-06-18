import c from 'coordtransform';
import log4js from 'log4js';
import { Operation } from 'express-openapi';
import { Service } from '../generated';
import { LocationService } from '../services';
import { parseQuery, sendError, sendSuccess } from '../utils';

export const get: Operation = (req, res) => {
    const data = parseQuery<typeof Service.getLocation>(req) as any;
    const logger = log4js.getLogger('location.get');

    switch (data['provider']) {
        case 'amap':
            LocationService.amap(data['keywords'], data['city'], data['page'])
                .then(result => {
                    logger.info(result);
                    sendSuccess(res, {
                        locations: result
                    })
                })
                .catch(err => {
                    logger.error(err);
                    sendError(res, 500, '系统繁忙');
                })
            break;
        case 'google':
            break;
    }
}