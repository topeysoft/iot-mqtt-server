import { MqttServer } from '../mqtt-server';
import { TopicParser } from '../../parsers/topic-parser/topic-parser';
import { Repository } from '../../repository/repository';
import { SmartDevice, HomieNode, HomieNodeCapability } from '../../models/smart-devices';
import { NodePropertyParser } from '../../parsers/node-property-parser/node-property-parser';
import { EventEmitter } from "events";

export class MqttMessageHandler {
    static events: EventEmitter = new EventEmitter();
    static handleReceived(topic: string, message: Buffer) {
        if (TopicParser.isDeviceFwTopic(topic)) {
            MqttMessageHandler.handleDeviceFwTopic(topic, message);
        } else if (TopicParser.isDeviceOtaStatusTopic(topic)) {
            MqttMessageHandler.handleDeviceOtaStatusTopic(topic, message);
        } else if (TopicParser.isDeviceStatTopic(topic)) {
            MqttMessageHandler.handleDeviceStatsTopic(topic, message);
        }
        else if (TopicParser.isDevicePropertyTopic(topic)) {
            MqttMessageHandler.handleDevicePropertiesTopic(topic, message);
        }
        else if (TopicParser.isDeviceNodePropertiesTopic(topic)) {
            MqttMessageHandler.handleDeviceNodePropertiesTopic(topic, message);
        }
        else if (TopicParser.isDeviceNodeCapabilitiesTopic(topic)) {
            MqttMessageHandler.handleDeviceNodeCapabilitiesTopic(topic, message);
        }
        else if (TopicParser.isDeviceNodeStateTopic(topic)) {
            MqttMessageHandler.handleDeviceNodeStateTopic(topic, message);
        }
        else if (TopicParser.isDeviceNodeStateSetterTopic(topic)) {
            MqttMessageHandler.handleDeviceNodeStateSetterTopic(topic, message);
        }
    }

    static handleDeviceStatsTopic(topic: string, message: Buffer) {
        var statParam = TopicParser.parseDeviceStatTopic(topic);
        console.info('STATS MESSAGE RECIEVED: ', statParam, message.toString());
        var device: SmartDevice = new SmartDevice();
        device.device_id = statParam.deviceId;
        device[cleanupNameForStorage(statParam.property)] = message.toString();
        Repository.updateOne('devices', { device_id: device.device_id }, device).then(result => {
            console.info('DEVICE UPDATED: ', device);
        });
    }
    static handleDeviceFwTopic(topic: string, message: Buffer) {
        var param = TopicParser.parseDeviceFwTopic(topic);
        console.info('FW MESSAGE RECIEVED: ', param, message.toString());
        var device: SmartDevice = new SmartDevice();
        device.device_id = param.deviceId;
        device['fw_' + cleanupNameForStorage(param.property)] = message.toString();

        var index = {
            key: {
                device_id: 1
            },
            name: "device_id",
            unique: true
        };
        Repository.updateOne('devices', { device_id: device.device_id }, device, { upsert: true }, true, [index]).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
        });
    }
    static handleDeviceOtaStatusTopic(topic: string, message: Buffer) {
        let param = TopicParser.parseDeviceOtaStatusTopic(topic);
        let status = message.toString();
        console.info('OTA STATUS MESSAGE RECIEVED: ', param, status);
        let MMH = MqttMessageHandler;
        if (+status === 202) {
            console.info('DEVICE OTA STATUS IS 202|READY');
            MMH.events.emit('device:ready_for_firmware', param);
        }
        //var device: SmartDevice = new SmartDevice();
        // device.device_id = param.deviceId;
        // device['fw_' + cleanupNameForStorage(param.property)] = message.toString();

        // var index = {
        //     key: {
        //         device_id: 1
        //     },
        //     name: "device_id",
        //     unique: true
        // };
        // Repository.updateOne('devices', { device_id: device.device_id }, device, { upsert: true }, true, [index]).then(result => {
        //     console.info('DEVICE UPDATED: ', device, result.result);
        // });
    }
    static handleDevicePropertiesTopic(topic: string, message: Buffer) {
        var propertyParam = TopicParser.parseDevicePropertyTopic(topic);
        console.info('DEVICE PROP MESSAGE RECIEVED: ', propertyParam, message.toString());
        var device: SmartDevice = new SmartDevice();
        device.device_id = propertyParam.deviceId;
        device[cleanupNameForStorage(propertyParam.property)] = message.toString();
        var index = {
            key: {
                device_id: 1
            },
            name: "device_id",
            unique: true
        };
        Repository.updateOne('devices', { device_id: device.device_id }, device, { upsert: true }, true, [index]).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
        });
    }
    static handleDeviceNodePropertiesTopic(topic: string, message: Buffer) {
        var propertyParam = TopicParser.parseNodePropertiesTopic(topic);
        console.info('DEVICE NODE PROP MESSAGE RECIEVED: ', propertyParam, message.toString());
        var node: any = {};
        node.device_id = propertyParam.deviceId;
        node.node_id = propertyParam.nodeId;
        node[cleanupNameForStorage(propertyParam.property)] = message.toString();

        Repository.updateOne('nodes', { $and: [{ device_id: node.device_id }, { node_id: node.node_id }] }, node, { upsert: true }).then(result => {
            console.info('NODE UPDATED: ', node, result.result);
        });
    }
    static handleDeviceNodeCapabilitiesTopic(topic: string, message: Buffer) {
        console.info('DEVICE NODE CAPABILITIES MESSAGE RECIEVED: ', topic, message.toString());
        var properties: HomieNodeCapability[] = new NodePropertyParser().parse(message.toString());
        var propertyParam = TopicParser.parseNodePropertiesTopic(topic);
        var node: any = {};
        node.device_id = propertyParam.deviceId;
        node.node_id = propertyParam.nodeId;
        node['capabilities'] = properties;
        Repository.updateOne('nodes', { $and: [{ device_id: node.device_id }, { node_id: node.node_id }] }, node, { upsert: true }).then(result => {
            console.info('NODE UPDATED: ', node, result.result);
        });
    }
    static handleDeviceNodeStateTopic(topic: string, message: Buffer) {
        console.info('DEVICE NODE STATE MESSAGE RECIEVED: ', topic, message.toString());
        var propertyParam = TopicParser.parseNodeStateTopic(topic);
        Repository.getOne<HomieNode>('nodes', { $and: [{ device_id: propertyParam.deviceId }, { node_id: propertyParam.nodeId }] }).then(node => {

            if (!node) {
                node = new HomieNode();
                node.node_id = propertyParam.nodeId;
                node.device_id = propertyParam.deviceId;
                return;
            }
            var identifierSelector = /(([a-zA-Z-]+))(?=_\d+)*/g;
            var identifierWithUnderscoreSelector = /(([a-zA-Z-]+)_)(?=\d*)/g;

            var identifierMatch = propertyParam.property.match(identifierSelector);
            if (!identifierMatch || identifierMatch.length < 1) return;
            var identifier = identifierMatch[0];
            var idReplaceMatch = propertyParam.property.match(identifierWithUnderscoreSelector);
            var idReplace = null;
            var rangeValue = null;
            if (idReplaceMatch && idReplaceMatch.length > 0) {
                idReplace = idReplaceMatch[0];
                try { rangeValue = parseInt(propertyParam.property.replace(idReplace, '')); } catch (e) { };
            };
            var identifier = identifierMatch[0];

            var capability = node.capabilities.find((c) => {
                return c.identifier && c.identifier === identifier;
            });
            if (!capability) return;
            var msg = message.toString();
            if (!capability.is_settable) {
                capability.value = msg;
            } else {
                if ((capability.is_range && rangeValue !== null)) {
                    capability.value = rangeValue;
                }
                capability.state = msg;
            }
            Repository.updateOne('nodes', { $and: [{ device_id: node.device_id }, { node_id: node.node_id }] }, node, { upsert: true }).then(result => {
                console.info('NODE UPDATED: ', node, result.result);
            });


        })

        // Repository.getByDeviceId(propertyParam.deviceId).then((device:any) => {
        //     if(!device || !device.nodes || device.nodes.length<1) return;
        //    var existingNode= device.nodes.find((node)=>{
        //        return node.id=propertyParam.nodeId;
        //     });

        //     var identifierMatch= propertyParam.property.match(identifierSelector);
        //     if(!identifierMatch || identifierMatch.length<1)return;
        //     var identifier = identifierMatch[0];
        //     var idReplaceMatch= propertyParam.property.match(identifierWithUnderscoreSelector);
        //     var idReplace=null;
        //     var rangeValue=null;
        //     if(idReplaceMatch && idReplaceMatch.length>0){
        //         idReplace=idReplaceMatch[0];
        //         try{rangeValue=parseInt(propertyParam.property.replace(idReplace, ''));}catch(e){};
        //     };
        //     var identifier = identifierMatch[0];

        //     if(!existingNode) return;
        //     if(!existingNode.capabilities||  existingNode.capabilities.length<1) return;
        //     var capability = existingNode.capabilities.find((c)=>{
        //         return c.identifier && c.identifier===identifier;
        //     });
        //     if(!capability) return;
        //     var msg=message.toString();
        //     if(!capability.is_settable){
        //         capability.value = msg; 
        //     }else{
        //         if((capability.is_range && rangeValue!==null)){
        //             capability.value=rangeValue;
        //         }
        //         capability.state=msg;
        //     }
        //     node.id = propertyParam.nodeId;
        //     node['capabilities'] = existingNode.capabilities;
        //     Repository.upsertNode(propertyParam.deviceId, node).then(result => {
        //         console.info('DEVICE NODE UPDATED: ', node, result.result);
        //     }).catch(e=>{

        //     });
        // })

    }
    static handleDeviceNodeStateSetterTopic(topic: string, message: Buffer) {
        console.info('DEVICE NODE PROP SETTER MESSAGE RECIEVED: ', topic, message.toString());
    }



}
function cleanupNameForStorage(name: string) {
    if (!name) {
        return name;
    }
    return name.replace('$', '');
}