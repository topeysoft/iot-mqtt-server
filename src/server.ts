import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import * as path from "path";
import * as express from 'express';
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import { IndexRoute } from "./routes/index";
import { MqttServer } from './mqtt-server/mqtt-server';
import { Repository } from './repository/repository';
import { Response, NextFunction, Router, Express } from 'express';
import { ApiRoutes } from './routes/api-routes/api-routes';
import { ConfigManager } from './configs/config-manager';
import { CorsFilterMiddleware } from './middlewares/request-headers/cors-filter.middleware';
import { RepositoryType } from './repository/repository-types';
import { Passport, PassportStatic } from 'passport';
import { PassportOpenIdMiddleware } from './middlewares/security/open-id/open-id';
import { OTAServer } from "./ota-server/ota-server";

export class Server {
    otaServer: any;
    public static bootstrap(): Server {
        return new Server();
    }
    constructor() {
        this.passport = new Passport();
        this.app = express();
        this.config();
        this.setupHeaders();
        this.routes();
        this.api();
        this.mqttServer = new MqttServer();;
        this.initializeRepository();
        var otaConfig=ConfigManager.get('ota')
        this.otaServer = new OTAServer(this.app, this.mqttServer, otaConfig);
    }
    public app: Express;
    public passport: Passport | any;

    public mqttServer;


    private config() {
        ConfigManager.initSync();
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "pug");
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser("super-strong-secret-dc0649f7-e9b9-4133-8e2e-6f4677bb3492"));
        this.app.use(methodOverride());
        this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
            err.status = 404;
            next(err);
        });
        this.setupSecurity();
        this.app.use(errorHandler());
        this.app.use((req, res, next) => {
            next()
        });
    }
    public routes() {
        let router: Router;
        router = Router();
        IndexRoute.create(router);
        this.app.use(router);
        new ApiRoutes(this.app);

    }
    public api() {

    }
    public setupHeaders() {
        new CorsFilterMiddleware(this.app);
    }
    public setupSecurity() {
      //  this.app.use(this.passport.initialize());
      //  this.app.use(this.passport.session());
       // new PassportOpenIdMiddleware(this.passport);
    }
    private initializeRepository() {
        var config = ConfigManager.getConfig();
        Repository.initialize(config.mongodb.connectionUrl, true);
        // Repository.initialize(config.tingodb.dbPath, RepositoryType.TingoDB)
    } 


}