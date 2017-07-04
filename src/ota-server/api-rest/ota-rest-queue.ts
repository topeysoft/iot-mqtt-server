import * as fs from 'fs';
import { MessengerService } from "./../../shared-services/messenger-service";
import { OTAFirmware } from "./../model/firmware";
import { SmartDevice } from "./../../models/smart-devices";
import * as path from 'path';
import * as express from 'express';
import { Express, Request, Response } from 'express';
import { Repository } from "./../../repository/repository";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, MULTI_STATUS, CREATED } from "http-status-codes";
import { ObjectID } from "mongodb";
import { EventEmitter } from "events";
export class QueueApiRoutes extends EventEmitter {
    private routePaths: any;
    static tempFilePath = 'firmwares-temp-path';
    constructor() {
        super();
        this.expressApp = express();
        this.routePaths = {
            queueDevices: `${this.basePath}devices`,
            queueFirmwares: `${this.basePath}firmwares`,
        };
        this.setup();
    }


    public expressApp: any;
    public basePath = '/';





    static getApp(): Express {
        var api = new QueueApiRoutes();
        return api.expressApp;
    };
    public setup() {
        this.expressApp.post(this.routePaths.queueDevices, (req, resp) => {
            return this.queueDevices(req, resp);
        });
        this.expressApp.post(this.routePaths.queueFirmwares, (req, resp) => {
            return this.queueFirmwares(req, resp);
        });
    }

    queueFirmwares(req: Request, resp: Response) {
        try {
            let firmwareIds = req.body.firmwareIds;
            let errorHander = (err) => {
                return resp.status(BAD_REQUEST).send(err.message);
            }
            if (!firmwareIds) throw new Error('No firmware specified');
            console.log(`Queueing up firmwares with ids ${firmwareIds}`)
            Repository.getManyFileInfo({query:{ _id: { $in: firmwareIds.map(id=>{return new ObjectID(id)}) } }}, 'firmwares')
                .then((firmwares: OTAFirmware[]) => {
                    let firmwareNames = firmwares.map(f => {
                        return f.name;
                    });
                    console.log(`Found firmwares with names ${firmwareNames}`)
                    Repository.getMany('devices', { query: { fw_name: { $in: firmwareNames } } }).then((devices: SmartDevice[]) => {
                        if (!devices || devices.length < 1) {
                            return errorHander(new Error('No device found for update queue.'));
                        }

                        console.log(`Found ${devices.length} devices`);

                        if (!firmwares || firmwares.length < 1) {
                            return errorHander(new Error('No device found for update queue.'));
                        }
                        let result: any[] = [];
                        devices.forEach(device => {
                            let fw = firmwares.find((f) => { return f.name === device.fw_name });
                            if (fw && fw.md5) {
                                this.publishQueueMessage(device.device_id, fw.md5);
                                result.push({ device: device, queued: true });
                            } else {
                                result.push({ device: device, queued: false });
                            }
                        });
                        return resp.send(result);
                    })
                        .catch(err => {
                            resp.send(INTERNAL_SERVER_ERROR);
                        })
                }).catch(errorHander);

        } catch (e) {
            return resp.status(BAD_REQUEST).send(e.message);
        }
    }
    queueDevices(req: Request, resp: Response) {
        try {
            let deviceIds = req.body.deviceIds;
            let errorHander = (err) => {
                return resp.status(BAD_REQUEST).send(err.message);
            }
            if (!deviceIds) throw new Error('No device specified');
            console.log(`Queueing up devices with device_ids ${deviceIds}`)
            Repository.getMany('devices', { query: { device_id: { $in: deviceIds } } }).then((devices: SmartDevice[]) => {
                if (!devices || devices.length < 1) {
                    return errorHander(new Error('No device found for update queue.'));
                }
                let firmwareNames = devices.map((d) => {
                    return d.fw_name;
                });
                console.log(`Found ${devices.length} devices`);
                Repository.getManyFileInfo({ name: { $in: firmwareNames } }, 'firmwares')
                    .then((firmwares: OTAFirmware[]) => {
                        if (!firmwares || firmwares.length < 1) {
                            return errorHander(new Error('No device found for update queue.'));
                        }
                        let result: any[] = [];
                        devices.forEach(device => {
                            let fw = firmwares.find((f) => { return f.name === device.fw_name });
                            if (fw && fw.md5) {
                                this.publishQueueMessage(device.device_id, fw.md5);
                                result.push({ device: device, queued: true });
                            } else {
                                result.push({ device: device, queued: false });
                            }
                        });
                        return resp.send(result);
                    })
                    .catch(err => {
                        resp.send(INTERNAL_SERVER_ERROR);
                    })
            }).catch(errorHander);

        } catch (e) {
            return resp.status(BAD_REQUEST).send(e.message);
        }
    }

    publishQueueMessage(deviceId, firmwareMd5) {
        MessengerService.instance.emit('OTA:publish_message', {
            topic: `devices/${deviceId}/$implementation/ota/checksum`,
            payload: firmwareMd5.toString(),
            qos: 2,
            retain: true
        });
    }

}