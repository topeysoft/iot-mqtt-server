import mosca = require('mosca');
import { EventEmitter } from "events";
import { ConfigManager } from '../configs/config-manager';
import path = require('path');
import express = require('express');
import { createServer, Server } from "http";
import { DataValidator } from "./validators/datadir";
import * as fs from "fs";

export class OTAServer {
  manifest: any;
  server: Server;
  app: any;
  manifestPath: any;
  dataDir: any;
  constructor(options) {
    this.dataDir = options.data_dir;
    this.manifestPath = path.resolve(path.join(this.dataDir, '/ota/manifest.json'));
    if (!options.app) {
      this.app = express();
      this.server = createServer(this.app);
      this.app.use('/ota', this._httpHandler);
    }

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
    fs.watchFile(this.manifestPath, (curr, prev) => {
      this.fetchManifest().then((data) => {
        console.log(`Manifest path is: ${this.manifestPath}`);
        console.log(`Manifest content is: ${data}`);
        console.log(`the current mtime is: ${curr.mtime}`);
        console.log(`the previous mtime was: ${prev.mtime}`);
      })

    });
  }

  fetchManifest() {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(this.manifestPath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
          } else {
            let manifest = JSON.parse(data);
            let valid =  DataValidator.validateOtaManifest(manifest, this.dataDir);
            if (!valid) {
             return reject(null);
            }
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
      let firmwareSize = await fs.statAsync(firmwarePath).size;
      if (firmwareSize > freeBytes) {
        log.error('OTA aborted, not enough free space on device', { deviceId: deviceId });
        return res.sendStatus(304);
      }

      firmwareBuffer = await fs.readFileAsync(firmwarePath);
    } catch (err) {
      log.error(`OTA aborted, cannot access firmware ${firmwarePath}`, { deviceId: deviceId });
      return res.sendStatus(304);
    }
    let firmwareMd5 = md5(firmwareBuffer);
    res.set('x-MD5', firmwareMd5);

    log.info('OTA update started', { deviceId: deviceId, version: firmware.version });

    return res.sendFile(path.resolve(firmwarePath)); // path resolve else with relative path express might cry
  }

}