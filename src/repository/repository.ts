
//import * as loki from 'lokijs';

import { MongoClient, MongoError, Db, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject, FindOneOptions, CollectionAggregationOptions, Collection } from 'mongodb';
import { RepoQueryParams } from './repo-query-params';
export class Repository {

    public static initialize(connectionUrl: string, force: boolean = false) {
        if (!Repository._db || force) {
            MongoClient.connect(connectionUrl, (err: MongoError, database: Db) => {
                if (err) return console.error("MongoDB Connection error:", err.message);
                Repository._db = database;
            });
        }
    }

    private static _repo: Repository;
    private static _db: Db;





    public static getOne<T>(collectionName: string, query): Promise<T> {
        return Repository._db.collection(collectionName).findOne(query);
    }
    public static getMany<T>(collectionName: string, queryParams: RepoQueryParams | any): Promise<T[]> {
        return Repository._db.collection(collectionName).find(queryParams.query, queryParams.fields, queryParams.skip, queryParams.limit).toArray();
    }

    public static aggregateOne<T>(collectionName: string, query: Object[] = [], options?: CollectionAggregationOptions): Promise<T> {
        return new Promise((resolve, reject) => {
            var cursor = Repository._db.collection(collectionName).aggregate(query, options);
            cursor.toArray().then(data => {
                data = data || [null]
                resolve(data[0]);
            }).catch(err => {
                reject(err);
            });
        });
    }
    public static aggregate<T>(collectionName: string, query: Object[] = [], options?: CollectionAggregationOptions): Promise<T[]> {
        var cursor = Repository._db.collection(collectionName).aggregate(query, options);
        return cursor.toArray();
    }
    public static insertOne<T>(collectionName: string, doc: T, createIndexes?: Object[]): Promise<InsertOneWriteOpResult> {
        var collection: Collection = Repository._db.collection(collectionName);
        if (createIndexes && createIndexes.length > 1) { collection.createIndexes(createIndexes) }
        return collection.insertOne(doc);
    }
    public static createIndexes(collectionName: string, indexes: any): Promise<InsertWriteOpResult> {
        return Repository._db.collection(collectionName).createIndexes(indexes);
    }
    public static insertMany<T>(collectionName: string, docs: T[]): Promise<InsertWriteOpResult> {
        return Repository._db.collection(collectionName).insertMany(docs);
    }


    public static updateOne<T>(collectionName: string, filter, doc: T, options = {}, setDate = true, createIndexes?: Object[]): Promise<UpdateWriteOpResult> {
        var collection: Collection = Repository._db.collection(collectionName);
        if (createIndexes && createIndexes.length > 1) { collection.createIndexes(createIndexes) }
        if (setDate) doc['last_modified'] = new Date().toISOString();
        delete doc['_id'];
        var update = {$set:doc};
        return collection.updateOne(filter, update, options);
    }
    // public static partiallyUpdate(collectionName: string, filter, update, options = {}, setDate = true, createIndexes?: Object[]): Promise<UpdateWriteOpResult> {
    //     var collection: Collection = Repository._db.collection(collectionName);
    //     if (createIndexes && createIndexes.length > 1) { collection.createIndexes(createIndexes) }
    //     return Repository._db.collection(collectionName).updateOne(filter, update, options);
    // }

    public static updateMany<T>(collectionName: string, filter, doc: T, options?): Promise<UpdateWriteOpResult> {
        return Repository._db.collection(collectionName).updateMany(filter, doc);
    }

    public static deleteOne<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return Repository._db.collection(collectionName).deleteOne(filter);
    }
    public static deleteMany<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return Repository._db.collection(collectionName).deleteMany(filter);
    }
    public static exists<T>(collectionName: string, filter): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            Repository._db.collection(collectionName).count(filter)
                .then((count) => resolve(count > 0))
                .catch((error) => reject(error));
        });
    }
}

