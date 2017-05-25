"use strict";
const topic_parser_1 = require('../../parsers/topic-parser/topic-parser');
const devices_repo_1 = require('../../repository/devices/devices-repo');
const smart_devices_1 = require('../../models/smart-devices');
const node_property_parser_1 = require('../../parsers/node-property-parser/node-property-parser');
class MqttMessageHandler {
    /**
     *
     */
    static handleReceived(topic, message) {
        if (topic_parser_1.TopicParser.isDeviceFwTopic(topic)) {
            MqttMessageHandler.handleDeviceFwTopic(topic, message);
        }
        if (topic_parser_1.TopicParser.isDeviceStatTopic(topic)) {
            MqttMessageHandler.handleDeviceStatsTopic(topic, message);
        }
        else if (topic_parser_1.TopicParser.isDevicePropertyTopic(topic)) {
            MqttMessageHandler.handleDevicePropertiesTopic(topic, message);
        }
        else if (topic_parser_1.TopicParser.isDeviceNodePropertiesTopic(topic)) {
            MqttMessageHandler.handleDeviceNodePropertiesTopic(topic, message);
        }
        else if (topic_parser_1.TopicParser.isDeviceNodeCapabilitiesTopic(topic)) {
            MqttMessageHandler.handleDeviceNodeCapabilitiesTopic(topic, message);
        }
        else if (topic_parser_1.TopicParser.isDeviceNodeStateTopic(topic)) {
            MqttMessageHandler.handleDeviceNodeStateTopic(topic, message);
        }
        else if (topic_parser_1.TopicParser.isDeviceNodeStateSetterTopic(topic)) {
            MqttMessageHandler.handleDeviceNodeStateSetterTopic(topic, message);
        }
    }
    static handleDeviceStatsTopic(topic, message) {
        var statParam = topic_parser_1.TopicParser.parseDeviceStatTopic(topic);
        console.info('STATS MESSAGE RECIEVED: ', statParam, message.toString());
        var device = new smart_devices_1.SmartDevice();
        device.device_id = statParam.deviceId;
        device[cleanupNameForStorage(statParam.property)] = message.toString();
        devices_repo_1.DeviceRepository.upsert(device).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
            devices_repo_1.DeviceRepository.getByDeviceId(device.device_id).then(deviceResult => {
                console.info('UPDATED DEVICE: ', deviceResult);
            })
                .catch(error => {
                console.info('UNABLE TO FETCH DEVICE: ', error);
            });
        });
    }
    static handleDeviceFwTopic(topic, message) {
        var param = topic_parser_1.TopicParser.parseDeviceFwTopic(topic);
        console.info('FW MESSAGE RECIEVED: ', param, message.toString());
        var device = new smart_devices_1.SmartDevice();
        device.device_id = param.deviceId;
        device['fw_' + cleanupNameForStorage(param.property)] = message.toString();
        devices_repo_1.DeviceRepository.upsert(device).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
        });
    }
    static handleDevicePropertiesTopic(topic, message) {
        var propertyParam = topic_parser_1.TopicParser.parseDevicePropertyTopic(topic);
        console.info('DEVICE PROP MESSAGE RECIEVED: ', propertyParam, message.toString());
        var device = new smart_devices_1.SmartDevice();
        device.device_id = propertyParam.deviceId;
        device[cleanupNameForStorage(propertyParam.property)] = message.toString();
        devices_repo_1.DeviceRepository.upsert(device).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
        });
    }
    static handleDeviceNodePropertiesTopic(topic, message) {
        var propertyParam = topic_parser_1.TopicParser.parseNodePropertiesTopic(topic);
        console.info('DEVICE NODE PROP MESSAGE RECIEVED: ', propertyParam, message.toString());
        var node = new smart_devices_1.HomieNode();
        node.id = propertyParam.nodeId;
        node[cleanupNameForStorage(propertyParam.property)] = message.toString();
        devices_repo_1.DeviceRepository.upsertNode(propertyParam.deviceId, node).then(result => {
            console.info('DEVICE NODE UPDATED: ', node, result.result);
        });
    }
    static handleDeviceNodeCapabilitiesTopic(topic, message) {
        new node_property_parser_1.NodePropertyParser().parse(message.toString());
        console.info('DEVICE NODE CAPABILITIES MESSAGE RECIEVED: ', topic, message.toString());
    }
    static handleDeviceNodeStateTopic(topic, message) {
        console.info('DEVICE NODE PROP MESSAGE RECIEVED: ', topic, message.toString());
    }
    static handleDeviceNodeStateSetterTopic(topic, message) {
        console.info('DEVICE NODE PROP MESSAGE RECIEVED: ', topic, message.toString());
    }
}
exports.MqttMessageHandler = MqttMessageHandler;
function cleanupNameForStorage(name) {
    if (!name) {
        return name;
    }
    return name.replace('$', '');
}
//# sourceMappingURL=mqtt-message-handler.js.map