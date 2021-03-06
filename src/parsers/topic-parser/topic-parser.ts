import * as  mqtt_regex   from "mqtt-regex";

export class TopicParser {
    /**
     *
     */

    private static  patterns = {
        devices_fw: 'devices/+deviceId/+fw/+property'
        , device_ota_status_report: 'devices/+deviceId/+implementation/+ota/+otaStatus'
        ,devices_stats: 'devices/+deviceId/+stats/+property'
        , devices_properties: 'devices/+deviceId/+property'
        , devices_sub_properties: 'devices/+deviceId/+property/+subProperty'
        , device_node_properties: 'devices/+deviceId/+nodeId/+property'
        , device_node_capabilities: 'devices/+deviceId/+nodeId/+property'
        , device_node_states: 'devices/+deviceId/+nodeId/+property'
        , device_node_states_setters: 'devices/+deviceId/+nodeId/+property/+set'

        , others: 'devices/+deviceId/#path'
    }
    

   static parse(topic: string, pattern: string) {
        return this.execute(topic, pattern);
    }
    static parseDeviceFwTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.devices_fw);
    }
    static parseDeviceOtaStatusTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.device_ota_status_report);
    }
    static parseDeviceStatTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.devices_stats);
    }
    static parseDevicePropertyTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.devices_properties);
    }
    static parseDeviceSubPropertyTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.devices_sub_properties);
    }
   static  parseNodePropertiesTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.device_node_properties);
    }
   static  parseNodeCapabilitiiesTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.device_node_capabilities);
    }
   static  parseNodeStateTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.device_node_states);
    }
   static  parseNodeStateSetterTopic(topic: string):IDeviceTopicParams {
        return this.execute(topic, this.patterns.device_node_states_setters);
    }

  static   isDeviceFwTopic(topic: string) {
      var result = this.parseDeviceFwTopic(topic);
        return (result.fw==='$fw');
    }
  static   isDeviceOtaStatusTopic(topic: string) {
      var result = this.parseDeviceOtaStatusTopic(topic);
        return (result.implementation==='$implementation' && result.ota==='ota' && result.otaStatus==='status');
    }
  static   isDeviceStatTopic(topic: string) {
      var result = this.parseDeviceStatTopic(topic);
        return (result.stats==='$stats');
    }
  static   isDevicePropertyTopic(topic: string) {
      var result = this.parseDevicePropertyTopic(topic);
        return ((result.property && result.property.indexOf('$')===0 && result.property!=='$stats' && result.property!=='$fw' && !result.nodeId));
    }
  static   isDeviceSubPropertyTopic(topic: string) {
      var result = this.parseDeviceSubPropertyTopic(topic);
        return ((result.property && result.subProperty && result.property.indexOf('$')===0 && result.property!=='$stats' && result.property!=='$fw' && !result.nodeId));
    }
  static   isDeviceNodePropertiesTopic(topic: string) {
      var result = this.parseNodePropertiesTopic(topic);
        return (result.nodeId && result.property && result.property.indexOf('$')===0  && result.property!=='$properties');
    }
  static   isDeviceNodeCapabilitiesTopic(topic: string) {
      var result = this.parseNodeCapabilitiiesTopic(topic);
        return (result.nodeId && result.property && result.property==='$properties');
    }
  static   isDeviceNodeStateTopic(topic: string) {
      var result = this.parseNodeStateTopic(topic);
        return (result.nodeId && result.property && result.property.indexOf('$')===-1 && result.property!=='$properties');
    }
  static   isDeviceNodeStateSetterTopic(topic: string) {
      var result = this.parseNodeStateSetterTopic(topic);
        return (result.nodeId && result.set && result.set=='set');
    }

    private static  execute(topic, pattern) {
        var info = mqtt_regex(pattern).exec;
        return info(topic)||{};
    }
} 

 export interface IDeviceTopicParams {
     deviceId:string;
     nodeId:string;
     stats:string;
     implementation:string;
     otaStatus:string;
     ota:string;
     subProperty:string;
     property:string;
     fw:string;
     set:string;
     path:string[];
};
