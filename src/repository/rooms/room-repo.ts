import { Repository } from '../repository';
import {  HomieNode } from '../../models/smart-devices';
import { Room } from '../../models/room';
import { ObjectID } from 'mongodb';
export class RoomRepository {
    private static collectionName = 'rooms';
    static upsert(device: Room, filter: any = undefined) {
        
    }
    static partiallyUpdate(id: string, node: any, filter: any = undefined) {

    }
    static getOne(filter) {
        return Repository.getOne<Room>(this.collectionName, filter);
    }
    static getById(id: string) {
        return Repository.getOne<Room>(this.collectionName, { _id: new ObjectID(id) });
    }
    static getByDeviceId(id: string) {
        return Repository.getOne<Room>(this.collectionName, { device_id: id });
    }

    static getMany(filter, fields = {}, skip: number = 0, limit: number = 1000) {
        return Repository.getMany<Room>(this.collectionName, { query: filter, fields: fields, skip: skip, limit: limit });
    }
    static search(query, skip = 0, limit: 1000) {
        return Repository.getMany<Room>(this.collectionName, { query: query, skip: skip, limit: limit });
    }

    static delete(device_id) {
        if (!device_id) throw new Error('Device ID must be specified');
        var filter: any = { $or: [{ device_id: device_id }] };
        try {
            filter.$or.push({ _id: new ObjectID(device_id) });
        } catch (e) { }

        return Repository.deleteOne<Room>(this.collectionName, filter);
    }


    static exists(id: string) {
        return Repository.exists<Room>(this.collectionName, { id: id });
    }


}