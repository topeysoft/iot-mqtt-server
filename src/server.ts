import * as bodyParser from "body-parser";
import { OtaApiServer } from "./ota-server/ota-api-server";
import { FileServer } from "./file-server/file-server";
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
import { MessengerService } from "./shared-services/messenger-service";
const fileUpload = require('express-fileupload');

export class Server {
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
        this.mqttServer = new MqttServer();
        this.initializeRepository();
        this.setupEventHandler();
    }
    public app: Express;
    public passport: Passport | any;

    public mqttServer:MqttServer;


    private config() {
        ConfigManager.initSync();
        this.config=ConfigManager.getConfig();
        let file_upload_limit = this.config['file_upload'].size_limit;
        //this.requestSizeLimit = this.config.request.size_limit || '1mb';
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "pug");
        this.app.use(logger("dev"));

       this.app.use(bodyParser.json({ limit: file_upload_limit }));
        this.app.use(bodyParser.urlencoded({ limit: file_upload_limit, extended: true }));

        this.app.use(cookieParser("super-strong-secret-dc0649f7-e9b9-4133-8e2e-6f4677bb3492"));
        this.app.use(methodOverride());

        this.app.use(fileUpload(
            { limits: { fileSize: file_upload_limit } }
        ));

        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.log('Error occured:', err );
            next(err);
        });
        this.setupSecurity();
        this.app.use(errorHandler());
        
    }
    public routes() {
        let router: Router;
        router = Router();
        IndexRoute.create(router);
        this.app.use(router);
        new ApiRoutes(this.app);

    }
    public api() {
           let fileServer = new FileServer().getApp();
           let otaServer =  OtaApiServer.getServer(this.config['ota']);
         
        this.app.use('/file-api', fileServer);
        this.app.use('/api/ota', otaServer);
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
        let mongoOptions = { connectionUrl: config.mongodb.connectionUrl, force: true, fileBucketName: 'iot-hub-bucket' }
        Repository.initialize(mongoOptions);
    }

    private setupEventHandler(){
         MessengerService.instance.on('OTA:publish_message', message=>{
              this.mqttServer.publishMessage(message);
          });
    }

}