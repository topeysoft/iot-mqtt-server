import * as  mqtt_regex from "mqtt-regex";
import { TopicParser } from './topic-parser/topic-parser';

export class EventParser extends TopicParser{
    /**
     *
     */

    private static event_patterns = {
        event_trigger: 'events/+eventid/+nodeId/+property/+set'
    }


   
    static parseEventTopic(topic: string): IEventTopicParams {
        return this.parse(topic, this.event_patterns.event_trigger);
    }

    static isDeviceNodeStateSetterTopic(topic: string) {
        var result = this.parseNodeStateSetterTopic(topic);
        return (result.nodeId && result.set && result.set == 'set');
    }

}

export interface IEventTopicParams {
    deviceId: string;
    nodeId: string;
    stats: string;
    implementation: string;
    otaStatus: string;
    ota: string;
    subProperty: string;
    property: string;
    fw: string;
    set: string;
    path: string[];
};
