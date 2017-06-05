import * as mosca from 'mosca';
import { EventEmitter } from "events";
import { MqttMessageHandler } from './handlers/mqtt-message-handler';
import { ConfigManager } from '../configs/config-manager';
// import http = require('http');

export class MqttServer extends EventEmitter {
  constructor() {
    super();
    this.init();

  }
  private moscaServer: mosca.Server;
  public attachHttpServer(httpServer) {
    this.moscaServer.attachHttpServer(httpServer);
  }
  private init() {
    var config = ConfigManager.getConfig();
    var mongoUrl = config.mongodb.connectionUrl;
    var datastore = {
      type: 'mongo',
      url: mongoUrl,
      pubsubCollection: 'moscadata',
      mongo: {}
    };

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
      console.log('client connected', client.id);
    });

    this.moscaServer.on('published', (packet, client) => {
      this.emit('received', packet, client);
      MqttMessageHandler.handleReceived(packet.topic, packet.payload);
      // console.log('Published : ', `topic-${packet.topic}`,`payload-${packet.payload.toString()}`);
    });

    this.moscaServer.on('subscribed', function (topic, client) {
      console.log('subscribed : ', topic);
    });

    this.moscaServer.on('unsubscribed', (topic, client) => {
      console.log('unsubscribed : ', topic);
    });

    this.moscaServer.on('clientDisconnecting', (client) => {
      console.log('clientDisconnecting : ', client.id);
    });

    this.moscaServer.on('clientDisconnected', (client) => {
      console.log('clientDisconnected : ', client.id);
    });

  }

  setup() {
    console.log('Mosca server is up and running');
    this.emit('ready')
  }

  publishMessage(message: {
    topic: string,
    payload: string | Buffer,
    qos: 0 | 1 | 2, // 0, 1, or 2
    retain: boolean
  }) {

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