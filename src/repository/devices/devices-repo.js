"use strict";
const repository_1 = require('../repository');
const mongodb_1 = require('mongodb');
class DeviceRepository {
    static upsert(device, filter = undefined) {
        if (!filter) {
            filter = { $or: [{ device_id: device.device_id }] };
            try {
                filter.$or.push({ _id: new mongodb_1.ObjectID(device._id) });
            }
            catch (e) { }
        }
        return repository_1.Repository.updateOne(this.collectionName, filter, device, { upsert: true });
    }
    static upsertNode(id, node, filter = undefined) {
        if (!filter) {
            filter = { $or: [{ device_id: id }] };
            try {
                filter.$or.push({ _id: new mongodb_1.ObjectID(id) });
            }
            catch (e) { }
        }
        var promise = new Promise((resolve, reject) => {
            var condition = { $and: [filter, { 'nodes.id': node.id }] };
            repository_1.Repository.exists(this.collectionName, condition)
                .then((exists) => {
                var update = {};
                if (exists) {
                    var obj = node;
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            update[`nodes.$.${key}`] = obj[key];
                        }
                    }
                    repository_1.Repository.updateOne(this.collectionName, condition, update)
                        .then((result) => {
                        resolve(result);
                    })
                        .catch(err => {
                        reject(err);
                    });
                }
                else {
                    repository_1.Repository.updateOne(this.collectionName, filter, { 'nodes': node }, {}, '$push')
                        .then((result) => {
                        resolve(result);
                    })
                        .catch(err => {
                        reject(err);
                    });
                }
            })
                .catch(err => {
                reject(err);
            });
        });
        return promise;
    }
    static getOne(filter) {
        return repository_1.Repository.getOne(this.collectionName, filter);
    }
    static getById(id) {
        return repository_1.Repository.getOne(this.collectionName, { id: id });
    }
    static getByDeviceId(id) {
        return repository_1.Repository.getOne(this.collectionName, { device_id: id });
    }
    static getMany(filter, fields = {}, skip = 0, limit = 1000) {
        return repository_1.Repository.getMany(this.collectionName, { query: filter, fields: fields, skip: skip, limit: limit });
    }
    static search(query, skip = 0, limit) {
        return repository_1.Repository.getMany(this.collectionName, { query: query, skip: skip, limit: limit });
    }
    static delete(device_id) {
        if (!device_id)
            throw new Error('Device ID must be specified');
        var filter = { $or: [{ device_id: device_id }] };
        try {
            filter.$or.push({ _id: new mongodb_1.ObjectID(device_id) });
        }
        catch (e) { }
        return repository_1.Repository.deleteOne(this.collectionName, filter);
    }
    static exists(id) {
        return repository_1.Repository.exists(this.collectionName, { id: id });
    }
}
DeviceRepository.collectionName = 'devices';
exports.DeviceRepository = DeviceRepository;
//# sourceMappingURL=devices-repo.js.map