
import { Express, Router, Request, Response } from 'express';
import * as express from 'express';
import { FirmwareApiRoutes } from "./ota-rest-firmware";
import { QueueApiRoutes } from "./ota-rest-queue";
export class OtaRestApi {

    //public base_path = "/";
    private app= express();
    public firmwareApi: Express
    constructor() {
        this.setup();
    }


    public setup() {
        this.firmwareApi = FirmwareApiRoutes.getApp();
        this.app.use('/firmwares', this.firmwareApi);
        this.app.use('/queue', QueueApiRoutes.getApp());
    }
    static getApp() {
        let api = new OtaRestApi();
        return api.app;
    }

}