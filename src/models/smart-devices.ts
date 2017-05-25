import { Required } from '../descriptors/validation-descriptors'
export class SmartDevice {
    _id: string;
    @Required('Device id is required.')
    device_id: string;
    name: string;
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
    id: string
    capabilities: HomieNodeCapability[] = []
    type: string = '';


}
export class HomieNodeCapability {
    identifier;
    is_range:boolean;
    is_settable: boolean;
    min: number;
    max: number;
}
