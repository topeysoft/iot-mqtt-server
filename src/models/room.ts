import { Required } from '../descriptors/validation-descriptors'
import { BaseModel } from './base';
import { HomieNode } from './smart-devices';
export class Room extends BaseModel {
       detail: string;
    controls: RoomControl[];
}

export class RoomControl{
    display_name: string;
    name: string;
    type: string;
    control_type: string;
    nodes: HomieNode[];
}
