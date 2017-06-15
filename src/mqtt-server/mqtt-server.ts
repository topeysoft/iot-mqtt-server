import * as mosca from 'mosca';
import { MqttMessage } from "./models/mqtt-message";
import { EventEmitter } from "events";
import { MqttMessageHandler } from './handlers/mqtt-message-handler';
import { ConfigManager } from '../configs/config-manager';
// import http = require('http');

export class MqttServer extends EventEmitter {
  private config: any;
  private mongoUrl: any;
  constructor() {
    super();
    this.init();
  }
  private moscaServer: mosca.Server;
  public attachHttpServer(httpServer) {
    this.moscaServer.attachHttpServer(httpServer);
  }
  private init() {
    this.config = ConfigManager.getConfig();
    this.mongoUrl = this.config.mongodb.connectionUrl;
    // var datastore = {
    //   type: 'mongo',
    //   url: this.mongoUrl,
    //   pubsubCollection: 'moscadata',
    //   mongo: {}
    // };

    var moscaSettings = {
      port: 1883,
      // backend: datastore,
      // persistence: {
      //   factory: mosca.persistence.Mongo,
      //   url: mongoUrl
      // }
    };

    this.moscaServer = new mosca.Server(moscaSettings);
    this.setupSecurity();
    this.moscaServer.on('ready', () => { this.setup() });


    this.moscaServer.on('clientConnected', (client) => {
      this.emit('client:connected', client.id);
      console.log('client connected', client.id);
    });

    this.moscaServer.on('published', (packet, client) => {
      this.emit('received', packet, client);
      MqttMessageHandler.handleReceived(packet.topic, packet.payload);
    });

    this.moscaServer.on('subscribed', function (topic, client) {
      console.log('subscribed: ', topic);
      this.emit('client:subscribed', topic);
    });

    this.moscaServer.on('unsubscribed', (topic, client) => {
      console.log('unsubscribed: ', topic);
    });

    this.moscaServer.on('clientDisconnecting', (client) => {
      console.log('clientDisconnecting: ', client.id);
    });

    this.moscaServer.on('clientDisconnected', (client) => {
      console.log('clientDisconnected: ', client.id);
    });

  }

  setup() {
    console.log('Mosca server is up and running');
    this.emit('ready')
    MqttMessageHandler.events.on('publish-message', (messageData:MqttMessage)=>{
        this.publishMessage(messageData)
    })
  }

  publishMessage(message: MqttMessage) {

    this.moscaServer.publish(message, () => {
    });


  }

  setupSecurity() {
    // this.server.authenticate = (client, username, password, callback) =>{

    //     var authorized = (username === 'alice' && password.toString() === 'secret');
    //     if (authorized) client.user = username;
    //     callback(null, authorized);
    // }
    // this.server.authenticate = () => {

    // }
    // this.server.authenticate = () => {

    // }
  }


}