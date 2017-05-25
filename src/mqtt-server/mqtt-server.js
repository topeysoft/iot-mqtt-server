"use strict";
const mosca = require('mosca');
const events_1 = require("events");
const mqtt_message_handler_1 = require('./handlers/mqtt-message-handler');
const config_manager_1 = require('../configs/config-manager');
// import http = require('http');
class Mqtt extends events_1.EventEmitter {
    constructor() {
        super();
        this.init();
    }
    // onReceived = new EventEmitter()
    init() {
        var config = config_manager_1.ConfigManager.getConfig();
        var mongoUrl = config.mongodb.connectionUrl;
        var datastore = {
            type: 'mongo',
            url: mongoUrl,
            pubsubCollection: 'moscadata',
            mongo: {}
        };
        var moscaSettings = {
            port: 1883,
            backend: datastore,
            persistence: {
                factory: mosca.persistence.Mongo,
                url: mongoUrl
            }
        };
        this.server = new mosca.Server(moscaSettings);
        this.server.on('ready', setup);
        function setup() {
            console.log('Mosca server is up and running');
        }
        this.server.on('clientConnected', function (client) {
            console.log('client connected', client.id);
        });
        this.server.on('published', (packet, client) => {
            this.emit('received', packet, client);
            mqtt_message_handler_1.MqttMessageHandler.handleReceived(packet.topic, packet.payload);
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
}
exports.Mqtt = Mqtt;
//# sourceMappingURL=mqtt-server.js.map