import mosca = require('mosca');
import { EventEmitter } from "events";
import { ConfigManager } from '../configs/config-manager';
import path = require('path');
import express = require('express');
import { createServer, Server } from "http";
import * as fs from "fs";
import * as md5 from "md5";
import { OTAManifest } from './model/manifest';
import { Validator } from './validators/validator';
import { R_OK, W_OK } from "constants";
import { Mqtt } from '../mqtt-server/mqtt-server';
import { Repository } from '../repository/repository';
import { SmartDevice } from '../models/smart-devices';

export class OTAServer {
  manifest: any;
  server: Server;
  app: any;
  manifestPath: any;
  dataDir: any;
  private mqttServer: Mqtt;
  constructor(app, mqttServer, options) {
    this.dataDir = options.data_dir;
    this.mqttServer=mqttServer;
    this.app=app;
    this.app.use('/ota', this._httpHandler);
    this.manifestPath = path.resolve(path.join(this.dataDir, '/ota/manifest.json'));
    // if (!options.app) {
    //   this.app = express();
    //   this.server = createServer(this.app);
    //   this.app.use('/ota', this._httpHandler);
    // }
    this.setup();
    // let watcher = chokidar.watch(this.manifestPath);
    // pauseable.pause(watcher); // Buffer events until dispatcher is ready
    // dispatcher.on('ready', () => {
    //   pauseable.resume(watcher);

    //   this._loadManifest().then((manifest) => {
    //     this.manifest = manifest;
    //     if (this.manifest) {
    //       this._warnDevices();
    //     }
    //   });

  }

  setup() {

    const mkdirIfNotExisting = (dir) => {
      try {
        fs.mkdirSync(dir);
      } catch (err) {
        return;
      }
    };

    const mkJsonIfNotExisting = (path, object) => {
      try {
        fs.accessSync(path, R_OK | W_OK);
      } catch (err) {
        fs.writeFileSync(path, JSON.stringify(object, null, 2), 'utf8');
      }
    };

    mkdirIfNotExisting(this.dataDir);
    mkdirIfNotExisting(path.join(this.dataDir, '/ota'));
    mkJsonIfNotExisting(path.join(this.dataDir, '/ota/manifest.json'), { firmwares: [] });
    mkdirIfNotExisting(path.join(this.dataDir, '/ota/firmwares'));
    mkdirIfNotExisting(path.join(this.dataDir, '/db'));
    fs.watchFile(this.manifestPath, (curr, prev) => {
      console.info('OTA manifest updated');
      this.utilizeManifest();
    });
  }

  utilizeManifest() {
    this.fetchManifest().then((data) => {
      this.manifest=data;
      this._warnDevices();
    }).catch(err=>{
      console.log('Unable to get manifest:', err);
    })

  }
  fetchManifest() {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(this.manifestPath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
          } else {
            let manifest: OTAManifest = JSON.parse(data);
           let validationResult = Validator.ValidateData('manifest', manifest);
            // if (!validationResult.valid) {
            //   console.log(validationResult)
            //   return reject('invalid manifest data');
            // }
            return resolve(manifest);
          }
        });
      } catch (error) {
        reject(error);
      }
    })
  }

  checkAllDeviceFirmware() {

  }

  publishFirwareChecksums() {

  }

  private latestDeviceFirmware(deviceId, version) {
    let deviceFirmware = null;
    this.manifest.firmwares.every((firmware) => {
      if (firmware.devices.indexOf(deviceId) > -1) {
        deviceFirmware = firmware;
        return false;
      }

      return true;
    });

    if (!deviceFirmware) {
      return false;
    }

    return deviceFirmware;
  }
  private outdated(deviceId, version) {
    let firmware = this.latestDeviceFirmware(deviceId, version);

    if (!firmware) {
      return false;
    }

    return firmware.version !== version;
  }

  async _httpHandler(req, res) {
    if (req.get('User-Agent') !== 'ESP8266-http-Update' || !req.get('x-ESP8266-free-space') || !req.get('x-ESP8266-version')) {
      return res.sendStatus(403);
    }

    let deviceData = req.get('x-ESP8266-version');
    let deviceId = deviceData.split('=')[0];
    let deviceVersion = deviceData.split(/=(.+)/)[1];
    let freeBytes = parseInt(req.get('x-ESP8266-free-space'), 10);

    if (!this.outdated(deviceId, deviceVersion)) {
      return res.sendStatus(304);
    }

    let firmware = this.latestDeviceFirmware(deviceId, deviceVersion);
    let firmwarePath = `${this.dataDir}/ota/firmwares/${firmware.name}.bin`;
    let firmwareBuffer;
    try {
      let firmwareSize = fs.statSync(firmwarePath).size;
      if (firmwareSize > freeBytes) {
        console.error('OTA aborted, not enough free space on device', { deviceId: deviceId });
        return res.sendStatus(304);
      }

      firmwareBuffer = fs.readFileSync(firmwarePath);
    } catch (err) {
      console.error(`OTA aborted, cannot access firmware ${firmwarePath}`, { deviceId: deviceId });
      return res.sendStatus(304);
    }
    let firmwareMd5 = md5(firmwareBuffer);
    res.set('x-MD5', firmwareMd5);

    console.info('OTA update started', { deviceId: deviceId, version: firmware.version });

    return res.sendFile(path.resolve(firmwarePath)); // path resolve else with relative path express might cry
  }

  _warnDevices() {
    Repository.getMany<SmartDevice>('devices', {skip:0, limit:1000, query:{}}).then(((devices) => {
          console.log('devices',devices);
      if (devices && devices.length > 0) {
        this.manifest.firmwares.forEach((firmware) => {
          console.log('firmware',firmware);
          devices.forEach((device) => {
            if (device.fw_name === firmware.name) {
              this.mqttServer.publishMessage({
                topic: `devices/${device.device_id}/$ota`,
                payload: firmware.version.toString(),
                qos: 2,
                retain: true
              });
            }
          });
        });
      }
    }));

  }

}