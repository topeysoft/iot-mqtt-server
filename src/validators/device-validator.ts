import { SmartDevice } from '../models/smart-devices';
import { ValidationResult } from './validation-result';
export class DeviceValidator{
    static validateForCreate(device:SmartDevice){
        var result:ValidationResult[]=[];
        if(!device.device_id || device.device_id.length<1){
           // result.push('device_id', 'device_id')
        }
    }
}