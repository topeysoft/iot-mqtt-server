"use strict";
const mqtt_regex = require("mqtt-regex");
class TopicParser {
    static parse(topic, pattern) {
        return this.execute(topic, pattern);
    }
    static parseDeviceFwTopic(topic) {
        return this.execute(topic, this.patterns.devices_fw);
    }
    static parseDeviceStatTopic(topic) {
        return this.execute(topic, this.patterns.devices_stats);
    }
    static parseDevicePropertyTopic(topic) {
        return this.execute(topic, this.patterns.devices_properties);
    }
    static parseDeviceSubPropertyTopic(topic) {
        return this.execute(topic, this.patterns.devices_sub_properties);
    }
    static parseNodePropertiesTopic(topic) {
        return this.execute(topic, this.patterns.device_node_properties);
    }
    static parseNodeCapabilitiiesTopic(topic) {
        return this.execute(topic, this.patterns.device_node_capabilities);
    }
    static parseNodeStateTopic(topic) {
        return this.execute(topic, this.patterns.device_node_states);
    }
    static parseNodeStateSetterTopic(topic) {
        return this.execute(topic, this.patterns.device_node_states_setters);
    }
    static isDeviceFwTopic(topic) {
        var result = this.parseDeviceFwTopic(topic);
        return (result.fw === '$fw');
    }
    static isDeviceStatTopic(topic) {
        var result = this.parseDeviceStatTopic(topic);
        return (result.stats === '$stats');
    }
    static isDevicePropertyTopic(topic) {
        var result = this.parseDevicePropertyTopic(topic);
        return ((result.property && result.property.indexOf('$') === 0 && result.property !== '$stats' && result.property !== '$fw' && !result.nodeId));
    }
    static isDeviceSubPropertyTopic(topic) {
        var result = this.parseDeviceSubPropertyTopic(topic);
        return ((result.property && result.subProperty && result.property.indexOf('$') === 0 && result.property !== '$stats' && result.property !== '$fw' && !result.nodeId));
    }
    static isDeviceNodePropertiesTopic(topic) {
        var result = this.parseNodePropertiesTopic(topic);
        return (result.nodeId && result.property && result.property.indexOf('$') === 0 && result.property !== '$properties');
    }
    static isDeviceNodeCapabilitiesTopic(topic) {
        var result = this.parseNodeCapabilitiiesTopic(topic);
        return (result.nodeId && result.property && result.property === '$properties');
    }
    static isDeviceNodeStateTopic(topic) {
        var result = this.parseNodeStateTopic(topic);
        return (result.nodeId && result.property && result.property.indexOf('$') === -1 && result.property !== '$properties');
    }
    static isDeviceNodeStateSetterTopic(topic) {
        var result = this.parseNodeStateSetterTopic(topic);
        return (result.nodeId && result.set && result.set == 'set');
    }
    static execute(topic, pattern) {
        var info = mqtt_regex(pattern).exec;
        return info(topic) || {};
    }
}
/**
 *
 */
TopicParser.patterns = {
    devices_fw: 'devices/+deviceId/+fw/+property',
    devices_stats: 'devices/+deviceId/+stats/+property',
    devices_properties: 'devices/+deviceId/+property',
    devices_sub_properties: 'devices/+deviceId/+property/+subProperty',
    device_node_properties: 'devices/+deviceId/+nodeId/+property',
    device_node_capabilities: 'devices/+deviceId/+nodeId/+property',
    device_node_states: 'devices/+deviceId/+nodeId/+property',
    device_node_states_setters: 'devices/+deviceId/+nodeId/+property/+set',
    others: 'devices/+deviceId/#path'
};
exports.TopicParser = TopicParser;
;
//# sourceMappingURL=topic-parser.js.map