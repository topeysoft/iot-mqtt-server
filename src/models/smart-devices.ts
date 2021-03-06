import { Required } from '../descriptors/validation-descriptors'
import { BaseModel } from './base';
export class SmartDevice extends BaseModel{
    @Required('Device id is required.')
    device_id: string;
    type: string;
    fw_name: string;
    fw_version: string;
    fw_checksum: string;
    online: boolean;
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
    display_name:string;
    description:string;
}
export class HomieNodeCapability {
     name: string;
    type: string = "read_write"
    display_name:string;
    identifier:string;
    is_metric:boolean;
    is_range:boolean;
    is_settable:boolean;
    min:number;
    max:number;
    value:any;
    state:any;
    unit:string;
    action:{topic?:string}
}
