export class MqttMessage{
    topic: string;
    payload: string | Buffer;
    qos: 0 | 1 | 2;  
    retain: boolean;
  }