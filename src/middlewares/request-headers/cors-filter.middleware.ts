import { Express } from "express-serve-static-core";
import { ConfigManager } from '../../configs/config-manager';

export class CorsFilterMiddleware {
    /**
     *
     */
    constructor(private app: Express) {
        var config = ConfigManager.getConfig();
        this.app.use(function (req, res, next) {
            var origin = req.headers.origin;
            if (config.cors.allowed_origins.indexOf(origin) > -1) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Methods', config.cors.allowed_methods);
            res.setHeader('Access-Control-Allow-Headers', config.cors.allowed_headers);
            res.setHeader('Access-Control-Allow-Credentials', config.cors.allow_credentials);
            next();
        });
    }
}