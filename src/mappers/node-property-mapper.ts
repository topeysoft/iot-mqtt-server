
import { HomieNode } from "../models/smart-devices";

const NodeTypeMap = {
    'light': 'Light Bulb',
    'bulb': 'Light Bulb',
    'light-bulb': 'Light bulb',
    'led-bulb': 'LED light bulb',
    'led-light': 'LED light',
    'rgbled': 'Multi-color LED light',
    'led-light-bulb': 'LED light bulb',
    'rgb-led-light': 'Multi-color LED light',
    'rgbw-led': 'Multi-color (+ white) LED light',
    'rgbw-led-light': 'Multi-color (+ white) LED light',

    'outlet': 'Power outlet',
    'wall-outlet': 'Power outlet',
    'power-outlet': 'Power outlet',

    'temprature': 'Temprature',
    'thermometer': 'Thermometer',
    'default': 'Generic',
    'undefined': 'Generic',
    'null': 'Generic',
    '': 'Generic'
}
export class NodePropertyMapper{
    getDisplayName(node:HomieNode) {
        return node.display_name ||  this.getDisplayType(node);
    }
    getDisplayType(node:HomieNode) {
        return NodeTypeMap[node.type] || NodeTypeMap['default'];
    }
    getDescription(node:HomieNode) {
        return node.description || this.getDisplayType(node);
    }
}
