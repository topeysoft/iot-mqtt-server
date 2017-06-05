import { HomieNode } from "../smart-devices";

export class AutomationEffect {
    device_id: string;
    node_id: string;
    value: any;
    node:HomieNode
}