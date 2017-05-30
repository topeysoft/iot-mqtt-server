import mosca = require('mosca');
import { EventEmitter } from "events";
import { ConfigManager } from '../configs/config-manager';
// import http = require('http');

export class OTAServer{
  constructor() {
    this.init();
  }
   private init() {
    var config = ConfigManager.getConfig();
    var mongoUrl = config.mongodb.connectionUrl;
  }


  checkAllDeviceFirmware(){
    
  }

  publishFirwareChecksums(){
    
  }


}