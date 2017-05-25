
import { MongoClient, MongoError, Db, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject, FindOneOptions } from "mongodb";
import { IRepository } from './i-repository';
import { RepoQueryParams } from './repo-query-params';
export class MongoRepository {
    
    //implements IRepository {
    // constructor(connectionUrl: string, force: boolean=false) {
    //     if (!MongoRepository._db || force) {
    //         MongoClient.connect(connectionUrl, (err: MongoError, database: Db) => {
    //             if (err) return console.error("MongoDB Connection error:", err.message);
    //             MongoRepository._db = database;
    //         });
    //     }
    // }

    private static _repo: MongoRepository;
    private static _db: Db |any;
   
    static getRepository(connectionUrl: string, force: boolean = false) {
        if (!MongoRepository._db || force) {
            MongoClient.connect(connectionUrl, (err: MongoError, database: Db) => {
                if (err) return console.error("MongoDB Connection error:", err.message);
                MongoRepository._db = database;
            });
        }

        return MongoRepository
    }

    

    public static getOne<T>(collectionName: string, query): Promise<T> {
        return MongoRepository._db.collection(collectionName).findOne(query);
    }
    public static getMany<T>(collectionName: string, queryParams: RepoQueryParams | any): Promise<T[]> {
        return MongoRepository._db.collection(collectionName).find(queryParams.query, queryParams.fields, queryParams.skip, queryParams.limit).toArray();
    }
    public static insertOne<T>(collectionName: string, doc: T): Promise<InsertOneWriteOpResult> {
        return MongoRepository._db.collection(collectionName).insertOne(doc);
    }
    public static insertMany<T>(collectionName: string, docs: T[]): Promise<InsertWriteOpResult> {
        return MongoRepository._db.collection(collectionName).insertMany(docs);
    }

    public static updateOne<T>(collectionName: string, filter, doc: T, options={}, action='$set', setDate=true): Promise<UpdateWriteOpResult> {
      var update = {};
      //  if(setDate) doc['last_modified']= new Date().toISOString();
        update[action]=doc;
        return MongoRepository._db.collection(collectionName).updateOne(filter, update, options);
    }
   
    public static updateMany<T>(collectionName: string, filter, doc: T, options?): Promise<UpdateWriteOpResult> {
        return MongoRepository._db.collection(collectionName).updateMany(filter, doc);
    }

    public static deleteOne<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return MongoRepository._db.collection(collectionName).deleteOne(filter);
    }
    public static deleteMany<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return MongoRepository._db.collection(collectionName).deleteMany(filter);
    }
    public static exists<T>(collectionName: string, filter): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            MongoRepository._db.collection(collectionName).count(filter)
                .then((count) => resolve(count > 0))
                .catch((error) => reject(error));
        });
    }
}