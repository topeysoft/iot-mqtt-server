import { HomieNode } from "../smart-devices";

export class AutomationEffect {
    device_id: string;
    node_id: string;
    capability_identifier:string;
    value: any;
    node:HomieNode
}