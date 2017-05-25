

import { MongoClient, MongoError, Db, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject, FindOneOptions } from "mongodb";
import { RepoQueryParams } from './repo-query-params';
export class TingoRepository {

    private static _repo: TingoRepository;
    private static _db: Db | any;
    static getRepository(dbPath: string = '/database', force=true) {
        if (!TingoRepository._db || force) {
            var Engine = require('tingodb')();
            TingoRepository._db = new Engine.Db(dbPath, {});
        }
        return TingoRepository;
    }


    public static getOne<T>(collectionName: string, query): Promise<T> {
        return TingoRepository._db.collection(collectionName).findOne(query);
    }
    public static getMany<T>(collectionName: string, queryParams: RepoQueryParams | any): Promise<T[]> {
        return TingoRepository._db.collection(collectionName).find(queryParams.query, queryParams.fields, queryParams.skip, queryParams.limit).toArray();
    }
    public static insertOne<T>(collectionName: string, doc: T): Promise<InsertOneWriteOpResult> {
        return TingoRepository._db.collection(collectionName).insertOne(doc);
    }
    public static insertMany<T>(collectionName: string, docs: T[]): Promise<InsertWriteOpResult> {
        return TingoRepository._db.collection(collectionName).insertMany(docs);
    }

    public static updateOne<T>(collectionName: string, filter, doc: T, options = {}, action = '$set', setDate = true): Promise<UpdateWriteOpResult> {
        var update = {};
        update[action] = doc;
        if (setDate) update['$currentDate'] = { lastModified: true };
        return TingoRepository._db.collection(collectionName)
        .updateOne(filter, update, options);
    }
    public static updateMany<T>(collectionName: string, filter, doc: T, options?): Promise<UpdateWriteOpResult> {
        return TingoRepository._db.collection(collectionName).updateMany(filter, doc);
    }

    public static deleteOne<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return TingoRepository._db.collection(collectionName).deleteOne(filter);
    }
    public static deleteMany<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return TingoRepository._db.collection(collectionName).deleteMany(filter);
    }
    public static exists<T>(collectionName: string, filter): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            TingoRepository._db.collection(collectionName).count(filter)
                .then((count) => resolve(count > 0))
                .catch((error) => reject(error));
        });
    }
}
