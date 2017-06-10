import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import * as path from "path";
import * as express from 'express';
import { Express } from 'express';
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import RtspStream = require('node-rtsp-stream');
export class Server {
    otaServer: any;
    public static bootstrap(): Server {
        return new Server();
    }
    constructor() {
        this.app = express();
        this.config();
    }
    public app: Express;
    private config() {
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
        this.app.use(errorHandler());
        this.app.use((req, res, next) => {
            next()
        });
    }

    setupStream() {
        // let stream = new RtspStream({
        //     name: 'name',
        //     streamUrl: 'rtsp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov',
        //     wsPort: 9999
        // });
    }

}