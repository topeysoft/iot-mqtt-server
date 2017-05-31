import * as mosca from 'mosca';
import { EventEmitter } from "events";
import { OnMqttConnectHandler } from './handlers/mqtt-connect-handler';
import { MqttMessageHandler } from './handlers/mqtt-message-handler';
import { ConfigManager } from '../configs/config-manager';
// import http = require('http');

export class Mqtt extends EventEmitter {
  constructor() {
    super();
    this.init();

  }
  server: mosca.Server;
  // onReceived = new EventEmitter()
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

    this.server = new mosca.Server(moscaSettings);
    this.setupSecurity();
    this.server.on('ready', setup);

    function setup() {
      console.log('Mosca server is up and running')
    }

    this.server.on('clientConnected', function (client) {
      console.log('client connected', client.id);
    });

    this.server.on('published', (packet, client) => {
      this.emit('received', packet, client);
      MqttMessageHandler.handleReceived(packet.topic, packet.payload);
      // console.log('Published : ', `topic-${packet.topic}`,`payload-${packet.payload.toString()}`);
    });

    this.server.on('subscribed', function (topic, client) {
      console.log('subscribed : ', topic);
    });

    this.server.on('unsubscribed', (topic, client) => {
      console.log('unsubscribed : ', topic);
    });

    this.server.on('clientDisconnecting', (client) => {
      console.log('clientDisconnecting : ', client.id);
    });

    this.server.on('clientDisconnected', (client) => {
      console.log('clientDisconnected : ', client.id);
    });

  }

  publishMessage(message:{
      topic: string,
      payload: string|Buffer, 
      qos: 0|1|2, // 0, 1, or 2
      retain: boolean 
    }) {

    this.server.publish(message,  ()=> {
      console.log('done!');
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