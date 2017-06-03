import { BaseModel } from './base';
export class Automation extends BaseModel {
    detail: string;
    control_states: ControlState[];
}

export class ControlState {
    control_id: string;
    state: string;
    value: number;
}