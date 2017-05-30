

import {types} from '../../misc/nodetypes';

export class PropertyValidator {
  _getPropertyObject (type, property) {
    let typeObject = types[type];
    if (!typeObject) {
      return false;
    }

    if (typeObject.alias) {
      typeObject = types[typeObject.alias];
    }

    let propertyObject = typeObject.properties[property];
    if (!propertyObject) {
      return false;
    }

    return propertyObject;
  }

  typeExists (type) {
    let typeObject = types[type];
    if (!typeObject) {
      return false;
    }

    return true;
  }

  canReceive (type, property, value) {
    let propertyObject = this._getPropertyObject(type, property);
    if (!propertyObject) {
      return false;
    }

    switch (propertyObject.type) {
      case 'boolean':
        return validator.isIn(value, ['true', 'false']);
      case 'float':
        return validator.isFloat(value);
      case 'percentage':
        return validator.isInt(value, { min: 0, max: 100 });
      case 'enum':
        return validator.isIn(value, propertyObject.oneOf);
      case 'blank':
        return true;
      case 'string':
        return true;
      default:
        return false;
    }
  }

  canSend (type, property, value) {
    if (!this.canReceive(type, property, value)) {
      return false;
    }

    let propertyObject = this._getPropertyObject(type, property);
    return propertyObject.settable;
  }

  convertValue (type, property, value) {
    let propertyObject = this._getPropertyObject(type, property);
    if (!propertyObject) {
      return undefined;
    }

    if (!this.canReceive(type, property, value)) {
      throw new Error('Cannot convert value');
    }

    switch (propertyObject.type) {
      case 'boolean':
        return value === 'true';
      case 'float':
        return parseFloat(value);
      case 'percentage':
        return parseInt(value, 10);
      case 'enum':
        return value;
      case 'blank':
        return null;
      case 'string':
        return value;
      default:
        return undefined;
    }
  }
}