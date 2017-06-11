import { Required } from '../descriptors/validation-descriptors'
import { BaseModel } from './base';
import { HomieNode } from './smart-devices';
export class Room extends BaseModel {
       detail: string;
    control_data: RoomControlData[];
}

export class RoomControlData{
    node_id:string;
    device_id:string;
    location:{x:number, y:number};
    node:HomieNode;
}
