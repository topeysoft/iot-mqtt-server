
import { Express, Router, Request, Response } from 'express';
import * as express from 'express';
import { FirmwareApiRoutes } from "./ota-rest-firmware";
export class OtaRestApi {

    public base_path = "/";
    public app: Express= express();
    public firmwareApi: Express
    constructor() {
        this.setup();
    }

    init(){
        this.setup();
    }

    public setup() {
        this.firmwareApi = FirmwareApiRoutes.getApp();
        this.app.use(this.base_path, this.firmwareApi);
    }
    static getApp() {
        let api = new OtaRestApi();
        return api.app;
    }

}