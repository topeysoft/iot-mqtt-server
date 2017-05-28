import { Required } from '../descriptors/validation-descriptors'
import { BaseModel } from './base';
export class SmartDevice extends BaseModel{
    @Required('Device id is required.')
    device_id: string;
    type: string;
}

export class HomieDevice {
    name: string;
    hardware_device_id: string;
    homie_esp8266_version: string;
    firmware: { name: string, verion: string };
    settings: Array<{
        name: string,
        description: string,
        type: any,
        required: boolean,
        default: any
    }>;
    strength: number;

    nodes: HomieNode[] = [];
}


export class HomieNode {
    _id:string;
    node_id: string;
    device_id: string;
    capabilities: HomieNodeCapability[] = [];
    type: string = '';


}
export class HomieNodeCapability {
    identifier;
    value:any;
    state:string;
    is_range:boolean;
    is_settable: boolean;
    min: number;
    max: number;
}
