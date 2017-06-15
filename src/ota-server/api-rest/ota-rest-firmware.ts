import * as express from 'express';
import { Express, Request, Response } from 'express';
import { Repository } from "./../../repository/repository.diskdb";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST } from "http-status-codes";
import { ObjectID } from "mongodb";
export class FirmwareApiRoutes {
    deleteFirmware: any;
    replaceFirmware: any;
    updateFirmware: any;
    createFirmware: any;
    /**
     *
     */


    static getApp(): Express {
        var api = new FirmwareApiRoutes();
        return api.expressApp;
    };
    constructor() {
        this.expressApp = express.Router();
    }

    init() {
        this.setup();
    }
    public expressApp: any;
    public basePath = '/firmwares';

    public setup() {
        this.expressApp.get(`${this.basePath}`, (req: Request, resp) => {
            return this.getFirmwares(req, resp);
        });
        this.expressApp.get(`${this.basePath}/:firmware_id`, (req, resp) => {
            return this.getFirmwareById(req, resp);
        });
        this.expressApp.post(`${this.basePath}`, (req, resp) => {
            return this.createFirmware(req, resp);
        });
        this.expressApp.put(`${this.basePath}/:firmware_id`, (req, resp) => {
            return this.replaceFirmware(req, resp);
        });
        this.expressApp.patch(`${this.basePath}/:firmware_id`, (req, resp) => {
            return this.updateFirmware(req, resp);
        });
        this.expressApp.delete(`${this.basePath}/:firmware_id`, (req, resp) => {
            return this.deleteFirmware(req, resp);
        });
    }

    getFirmwares(req: Request, resp: Response) {
        return Repository.getMany('firmwares', {})
            .then((data) => {
                resp.send(data);
            })
            .catch(err => {
                resp.send(INTERNAL_SERVER_ERROR);
            })
    }
    getFirmwareById(req: Request, resp: Response) {
        try {
            let id = new ObjectID(req.params["firmware_id"])
            Repository.getOne('firmwares', { _id: id })
                .then((data) => {
                    resp.send(data);
                })
                .catch(err => {
                    resp.send(INTERNAL_SERVER_ERROR);
                })
        } catch (error) {
            resp.send(BAD_REQUEST);
        }
    }

}