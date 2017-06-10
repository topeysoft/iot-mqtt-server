
import { FirmwareApiRoutes } from "./firmware";
import { Express, Router, Request, Response } from 'express';
export class ApiRoutes {
    /**
       *
       */
    private base_path = "api/ota";
    private router:Express
    constructor(private app: Express) {
       let firmwareApi= FirmwareApiRoutes.getRoutes();

      //  this.app.use(this.base_path, firmwareApi);
    }
}