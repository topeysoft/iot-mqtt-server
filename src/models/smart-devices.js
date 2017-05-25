"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const validation_descriptors_1 = require('../descriptors/validation-descriptors');
class SmartDevice {
}
__decorate([
    validation_descriptors_1.Required('Device id is required.'), 
    __metadata('design:type', String)
], SmartDevice.prototype, "device_id", void 0);
exports.SmartDevice = SmartDevice;
class HomieDevice {
    constructor() {
        this.nodes = [];
    }
}
exports.HomieDevice = HomieDevice;
class HomieNode {
    constructor() {
        this.capabilities = [];
        this.type = '';
    }
}
exports.HomieNode = HomieNode;
class HomieNodeCapability {
    constructor() {
        this.type = "read_write";
    }
}
exports.HomieNodeCapability = HomieNodeCapability;
//# sourceMappingURL=smart-devices.js.map