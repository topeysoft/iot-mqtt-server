import { Mqtt } from '../mqtt-server';
import { TopicParser } from '../../parsers/topic-parser/topic-parser';
import { DeviceRepository } from '../../repository/devices/devices-repo';
import { SmartDevice, HomieNode, HomieNodeCapability } from '../../models/smart-devices';
import { NodePropertyParser } from '../../parsers/node-property-parser/node-property-parser';
export class MqttMessageHandler {
    static handleReceived(topic: string, message: Buffer) {
        if (TopicParser.isDeviceFwTopic(topic)) {
            MqttMessageHandler.handleDeviceFwTopic(topic, message);
        }
        if (TopicParser.isDeviceStatTopic(topic)) {
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
        DeviceRepository.upsert(device).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
            DeviceRepository.getByDeviceId(device.device_id).then(deviceResult => {
                console.info('UPDATED DEVICE: ', deviceResult);
            })
                .catch(error => {
                    console.info('UNABLE TO FETCH DEVICE: ', error);
                });
        });
    }
    static handleDeviceFwTopic(topic: string, message: Buffer) {
        var param = TopicParser.parseDeviceFwTopic(topic);
        console.info('FW MESSAGE RECIEVED: ', param, message.toString());
        var device: SmartDevice = new SmartDevice();
        device.device_id = param.deviceId;
        device['fw_' + cleanupNameForStorage(param.property)] = message.toString();
        DeviceRepository.upsert(device).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
        });
    }
    static handleDevicePropertiesTopic(topic: string, message: Buffer) {
        var propertyParam = TopicParser.parseDevicePropertyTopic(topic);
        console.info('DEVICE PROP MESSAGE RECIEVED: ', propertyParam, message.toString());
        var device: SmartDevice = new SmartDevice();
        device.device_id = propertyParam.deviceId;
        device[cleanupNameForStorage(propertyParam.property)] = message.toString();
        DeviceRepository.upsert(device).then(result => {
            console.info('DEVICE UPDATED: ', device, result.result);
        });
    }
    static handleDeviceNodePropertiesTopic(topic: string, message: Buffer) {
        var propertyParam = TopicParser.parseNodePropertiesTopic(topic);
        console.info('DEVICE NODE PROP MESSAGE RECIEVED: ', propertyParam, message.toString());
        var node: any = {};
        node.id = propertyParam.nodeId;
        node[cleanupNameForStorage(propertyParam.property)] = message.toString();
        DeviceRepository.upsertNode(propertyParam.deviceId, node).then(result => {
            console.info('DEVICE NODE UPDATED: ', node, result.result);
        });
    }
    static handleDeviceNodeCapabilitiesTopic(topic: string, message: Buffer) {
        console.info('DEVICE NODE CAPABILITIES MESSAGE RECIEVED: ', topic, message.toString());
        var properties: HomieNodeCapability[] = new NodePropertyParser().parse(message.toString());
        var propertyParam = TopicParser.parseNodePropertiesTopic(topic);
        var node: any = {};
        node.id = propertyParam.nodeId;
        node['capabilities'] = properties;
        DeviceRepository.upsertNode(propertyParam.deviceId, node).then(result => {
            console.info('DEVICE NODE UPDATED: ', node, result.result);
        });
    }
    static handleDeviceNodeStateTopic(topic: string, message: Buffer) {
        console.info('DEVICE NODE STATE MESSAGE RECIEVED: ', topic, message.toString());
        var propertyParam = TopicParser.parseNodeStateTopic(topic);
        var node: any = {};
        var identifierSelector=/(([a-zA-Z-]+))(?=_\d+)*/g;
        var identifierWithUnderscoreSelector=/(([a-zA-Z-]+)_)(?=\d*)/g;

        DeviceRepository.getByDeviceId(propertyParam.deviceId).then((device:any) => {
            if(!device || !device.nodes || device.nodes.length<1) return;
           var existingNode= device.nodes.find((node)=>{
               return node.id=propertyParam.nodeId;
            });
            
            var identifierMatch= propertyParam.property.match(identifierSelector);
            if(!identifierMatch || identifierMatch.length<1)return;
            var identifier = identifierMatch[0];
            var idReplaceMatch= propertyParam.property.match(identifierWithUnderscoreSelector);
            var idReplace=null;
            var rangeValue=null;
            if(idReplaceMatch && idReplaceMatch.length>0){
                idReplace=idReplaceMatch[0];
                try{rangeValue=parseInt(propertyParam.property.replace(idReplace, ''));}catch(e){};
            };
            var identifier = identifierMatch[0];

            if(!existingNode) return;
            if(!existingNode.capabilities||  existingNode.capabilities.length<1) return;
            var capability = existingNode.capabilities.find((c)=>{
                return c.identifier && c.identifier===identifier;
            });
            if(!capability) return;
            var msg=message.toString();
            if(!capability.is_settable){
                capability.value = msg; 
            }else{
                if((capability.is_range && rangeValue!==null)){
                    capability.value=rangeValue;
                }
                capability.state=msg;
            }
            node.id = propertyParam.nodeId;
            node['capabilities'] = existingNode.capabilities;
            DeviceRepository.upsertNode(propertyParam.deviceId, node).then(result => {
                console.info('DEVICE NODE UPDATED: ', node, result.result);
            }).catch(e=>{
               
            });
        })

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