import ismyjsonvalid from 'is-my-json-valid';

import propertyValidator from './property';
import log from '../log';

export class DataDirValidator {
  static validateOtaManifest (object, dataDir) {
    return new Promise(function (resolve) {
      let validate = ismyjsonvalid({
        required: true,
        type: 'object',
        additionalProperties: false,
        properties: {
          firmwares: {
            required: true,
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: {
                  required: true,
                  type: 'string'
                },
                version: {
                  required: true,
                  type: 'string'
                },
                devices: {
                  required: true,
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      });

      if (!validate(object)) {
        log.error('OTA manifest invalid');
        return resolve(false);
      }

      // Check if a device is referenced multiple times

      let deviceIds = object.firmwares.map(function (device) {
        return device.id;
      });

      if ((new Set(deviceIds)).size !== deviceIds.length) {
        log.error('OTA manifest references multiple firmwares for a single device');
        return resolve(false);
      }

      if (!dataDir) {
        return resolve(true);
      }
      // Check if all firmware binaries exist

      let errors = false;
      object.firmwares.forEach(async function (firmware, index) {
        try {
           fs.accessAsync(`${dataDir}/ota/firmwares/${firmware.name}.bin`, fs.F_OK);
        } catch (err) {
          log.error(`Cannot find firmware ${dataDir}/ota/firmwares/${firmware.name}.bin`);
          errors = true;
        }

        if (index === object.firmwares.length - 1) {
          if (errors) {
            resolve(false);
          }

          resolve(true);
        }
      });
    });
  }

  validateInfrastructure (object) {
    let validate = ismyjsonvalid({
      required: true,
      type: 'object',
      additionalProperties: false,
      properties: {
        devices: {
          required: true,
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: {
                required: true,
                type: 'string'
              },
              location: {
                required: true,
                type: 'string'
              },
              color: {
                required: false,
                type: 'string'
              },
              nodes: {
                required: true,
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    type: {
                      required: true,
                      type: 'string'
                    },
                    id: {
                      required: true,
                      type: 'string'
                    },
                    name: {
                      required: true,
                      type: 'string'
                    },
                    color: {
                      required: false,
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        },
        groups: {
          required: true,
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              id: {
                required: true,
                type: 'string'
              },
              name: {
                required: true,
                type: 'string'
              },
              color: {
                required: false,
                type: 'string'
              },
              devices: {
                required: true,
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    });

    if (!validate(object)) {
      log.error('infrastructure.yml invalid');
      return false;
    }

    // Check if there are no duplicates device ids
    let deviceIds = object.devices.map(function (device) {
      return device.id;
    });

    if ((new Set(deviceIds)).size !== deviceIds.length) {
      log.error('infrastructure.yml contains duplicate devices');
      return false;
    }

    // Check if there are no duplicates node ids
    let duplicateNodes = false;
    object.devices.forEach(function (device) {
      // Check if there are no duplicates device ids
      let nodeIds = device.nodes.map(function (node) {
        return node.id;
      });

      if ((new Set(nodeIds)).size !== nodeIds.length) {
        duplicateNodes = true;
      }
    });

    if (duplicateNodes) {
      log.error('infrastructure.yml contains duplicate nodes');
      return false;
    }

    // Check if there are no duplicates group ids
    let groupsIds = object.groups.map(function (group) {
      return group.id;
    });

    if ((new Set(groupsIds)).size !== groupsIds.length) {
      log.error('infrastructure.yml contains duplicate groups');
      return false;
    }

    // Check if all devices in group exist
    let devicesExist = true;
    object.groups.forEach(function (group) {
      group.devices.forEach(function (deviceId) {
        if (deviceIds.indexOf(deviceId) <= -1) {
          devicesExist = false;
        }
      });
    });

    if (!devicesExist) {
      log.error('infrastructure.yml groups reference non-existent devices');
      return false;
    }

    // Check if all node types are valid
    let nodeTypesValid = true;
    object.devices.forEach(function (device) {
      device.nodes.forEach(function (node) {
        if (!propertyValidator.typeExists(node.type)) {
          nodeTypesValid = false;
        }
      });
    });

    if (!nodeTypesValid) {
      log.error('infrastructure.yml contains invalid node types');
      return false;
    }

    return true;
  }

  validateConfig (object) {
    let validate = ismyjsonvalid({
      required: true,
      type: 'object',
      additionalProperties: false,
      properties: {
        mqtt: {
          required: true,
          type: 'object',
          additionalProperties: false,
          properties: {
            url: {
              required: true,
              type: 'string'
            },
            username: {
              required: false,
              type: 'string'
            },
            password: {
              required: false,
              type: 'string'
            },
            clientId: {
              required: false,
              type: 'string'
            }
          }
        }
      }
    });

    if (!validate(object)) {
      log.error('config.yml invalid');
      return false;
    }

    return true;
  }
}
