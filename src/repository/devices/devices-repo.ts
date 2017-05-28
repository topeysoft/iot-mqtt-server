import { Repository } from '../repository';
import { SmartDevice, HomieNode } from '../../models/smart-devices';
import { ObjectID } from 'mongodb';
export class DeviceRepository {
    private static collectionName = 'devices';
    static upsert(device: SmartDevice, filter: any = undefined) {
        if (!filter) {
            filter = { $or: [{ device_id: device.device_id }] };
            try {
                filter.$or.push({ _id: new ObjectID(device._id) });
            } catch (e) { }
        }
        return Repository.updateOne<SmartDevice>(this.collectionName, filter, device, { upsert: true });
    }
    static upsertNode(id: string, node: any, filter: any = undefined) {
        if (!filter) {
            filter = { $or: [{ device_id: id }] };
            try {
                filter.$or.push({ _id: new ObjectID(id) });
            } catch (e) { }
        }
        var promise = new Promise<any>((resolve, reject) => {
            var condition = { $and: [filter, { 'nodes.id': node.id }] };

            Repository.exists(this.collectionName, condition)
                .then((exists) => {
                    var update = {};
                    if (exists) {
                        Repository.getOne<any>(this.collectionName, condition)
                            .then((deviceObj) => {
                                var existingNode = deviceObj.nodes.find((item) => { return item.id === node.id });
                               var mergedNode = Object.assign(existingNode, node);
                                var obj:Object = mergedNode;
                                for (var key in obj) {
                                    if (obj.hasOwnProperty(key)) {
                                        update[`nodes.$.${key}`] = obj[key];
                                    }
                                }
                                Repository.updateOne(this.collectionName, condition, update)
                                    .then((result) => {
                                        resolve(result);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    });
                            });

                    } else {
                        // Repository.updateOne(this.collectionName, filter, { 'nodes': node }, {}, '$push')
                        //     .then((result) => {
                        //         resolve(result);
                        //     })
                        //     .catch(err => {
                        //         reject(err);
                        //     })
                    }
                })
                .catch(err => {
                    reject(err);
                })
        });

        return promise;
    }
    static getOne(filter) {
        return Repository.getOne<SmartDevice>(this.collectionName, filter);
    }
    static getById(id: string) {
        return Repository.getOne<SmartDevice>(this.collectionName, { id: id });
    }
    static getByDeviceId(id: string) {
        return Repository.getOne<SmartDevice>(this.collectionName, { device_id: id });
    }

    static getMany(filter, fields = {}, skip: number = 0, limit: number = 1000) {
        return Repository.getMany<SmartDevice>(this.collectionName, { query: filter, fields: fields, skip: skip, limit: limit });
    }
    static search(query, skip = 0, limit: 1000) {
        return Repository.getMany<SmartDevice>(this.collectionName, { query: query, skip: skip, limit: limit });
    }

    static delete(device_id) {
        if (!device_id) throw new Error('Device ID must be specified');
        var filter: any = { $or: [{ device_id: device_id }] };
        try {
            filter.$or.push({ _id: new ObjectID(device_id) });
        } catch (e) { }

        return Repository.deleteOne<SmartDevice>(this.collectionName, filter);
    }


    static exists(id: string) {
        return Repository.exists<SmartDevice>(this.collectionName, { id: id });
    }


}