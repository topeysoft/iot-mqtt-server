import { SmartDevice } from '../models/smart-devices';
import { MqttMessageHandler } from '../mqtt-server/handlers/mqtt-message-handler';
import { OtaRestApi } from './api-rest/ota-rest-app';
import { FirmwareApiRoutes } from './api-rest/ota-rest-firmware';
import * as fs from 'fs';
import * as path from 'path';
let shortid = require('shortid');
import { Repository } from '../repository/repository';
import * as express from 'express';
import { Response, Request } from 'express';
import { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED, MULTI_STATUS } from "http-status-codes";
import { ObjectID } from "mongodb";
import { EventEmitter } from "events";
import { MessengerService } from "../shared-services/messenger-service";

export class OtaApiServer extends EventEmitter {
  static tempPath: string;
  private static instance: OtaApiServer;
  /**
   *
   */
  private config;
  constructor(config) {
    super();
    this.config = config;
    OtaApiServer.instance = this;
    this.setup();
  }

  private baseUrl = '/';
  private expressApp;

  private setup() {
    this.expressApp = express();
    this.setupRoutes();
    this.setupListeners();
  }
  private setupRoutes() {
    this.expressApp.use("/", OtaRestApi.getApp());
  }
  static getServer(config) {
    return new OtaApiServer(config).expressApp;
  }

  setupListeners() {
    MqttMessageHandler.events.on('device:ready_for_firmware', (params) => {
      this.publishFirmware([params.deviceId]);
      console.log("DEVICE IS LISTENING", params);
    });
  }


  publishFirmware(deviceIds: string[]) {
    if (!deviceIds || deviceIds.length < 1) return;
    Repository.getOne('devices', {query:{ device_id: { $in: deviceIds } }}).then((devices: SmartDevice[]) => {
      Repository.getManyFileInfo({query:{ name: { $in: devices.map(d => { return d.fw_name }) } }}, 'firmwares')
        .then((firmwares) => {
          devices.forEach(d => {
            let firmware: any = firmwares.find((f: any) => { return f.name === d.fw_name });
            if (!firmware) return;
            Repository.getFileData({ _id: firmware._id }, '', 'firmwares')
              .then((firmwarePath: string) => {
                let firmwareBuffer;
                try {
                  firmwareBuffer = fs.readFileSync(firmwarePath);
                } catch (err) {
                  console.error(`OTA aborted, cannot find firmware ${firmware._id}`, { deviceId: d._id });
                  return;
                }
                MessengerService.instance.emit('OTA:publish_message', {
                  topic: `devices/${d.device_id}/$implementation/ota/firmware`,
                  payload: firmwareBuffer,
                  qos: 0,
                  retain: false
                })
              }).catch(err => {
                console.info('OTA update firmware bin not found', { deviceId: d._id, version: firmware.version, checksum: firmware.md5 });
              })
            console.info('OTA update started', { deviceId: d._id, version: firmware.version, checksum: firmware.md5 });
          });
        }).catch(err => {
        console.log(`Firmware info not found`, err);
        })

    })
      .catch(err => {
        console.log(`No device found for ids: ${deviceIds}`, err);
      });

  }

}