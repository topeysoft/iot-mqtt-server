import * as express from 'express';
import {Express, Request, Response} from 'express';
import { Repository } from "./../../repository/repository.diskdb";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST } from "http-status-codes";
import { ObjectID } from "mongodb";
export class FirmwareApiRoutes {
    /**
     *
     */

    static getRoutes():Express{
        return (new FirmwareApiRoutes()).routes;
    };
    constructor() {
        this.basePath = `firmwares`;
        this.routes = express();
        this.setup();
    }

    private routes:Express;
    private basePath;

    public setup() {
        this.routes.get(`${this.basePath}`, (req:Request, resp) => {
            return this.getFirmwares(req, resp);
        });
        this.routes.get(`${this.basePath}/:firmware_id`, (req, resp) => {
            return this.getFirmwareById(req, resp);
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
            let id= new ObjectID(req.params["firmware_id"])
             Repository.getOne('firmwares', { _id:id })
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