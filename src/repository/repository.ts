import * as path from 'path';
import * as fs from 'fs';

//import * as loki from 'lokijs';

import { MongoClient, MongoError, Db, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject, FindOneOptions, CollectionAggregationOptions, Collection, GridFSBucket, GridFSBucketReadStream, ObjectID } from 'mongodb';
import { RepoQueryParams } from './repo-query-params';
let Grid = require('gridfs');

export class Repository {

    public static initialize(options: { connectionUrl: string, force: boolean, fileBucketName?: string } = { connectionUrl: '', force: false, fileBucketName: 'my-files-bucket' }) {
        if (!Repository._db || options.force) {
            MongoClient.connect(options.connectionUrl, (err: MongoError, database: Db) => {
                if (err) return console.error("MongoDB Connection error:", err.message);
                Repository._db = database;
                Repository._bucketName = options.fileBucketName||"my_file_bucket";
               // Repository._bucket = Repository.getBucket(Repository._bucketName );
            });
        }
    }

    private static getBucket(bucketName?:string){
        bucketName=bucketName||Repository._bucketName;
      return new GridFSBucket(Repository._db, { bucketName: bucketName });
    }

    private static _repo: Repository;
    private static _db: Db;
    private static _bucketName: string;
  //  private static _bucket: GridFSBucket;





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
        var update = { $set: doc };
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


    //  GRID FS
    public static getFileData<T>(query, tempFilePath, bucketName?:string): Promise<T> {
          bucketName=bucketName||Repository._bucketName;
          return new Promise((resolve, reject) => {
            Repository.getOneFileInfo(query).then((info: any) => {
                if (!info) return reject('File not found');
                let tempFileName = path.join(tempFilePath, info.filename);
                let dir = path.dirname(tempFileName);
                try{
                    let fileStat=fs.statSync(tempFileName);
                    if(fileStat && fileStat.mtime.getTime()>info.uploadDate.getTime()){
                        console.log('Using cached version');
                        return resolve(path.resolve(tempFileName));
                    }
                }catch(err){}
                try {
                    Repository.mkdirRecursive(dir);
                } catch (err) {
                    console.log('Unable to create dir', dir, err);
                }
                console.log('Opening stream');
                Repository.getBucket().openDownloadStreamByName(info.filename)
                    .pipe(fs.createWriteStream(tempFileName)).
                    on('error', (error) => {
                        console.log('Stream error', error);

                        reject(error);
                    }).
                    on('finish', () => {
                        console.log('Stream finished');
                        resolve(path.resolve(tempFileName));
                    });
            }).catch(err => {
                console.log('Unable to get info', err);
                reject(err);
            })

        })
    }
    public static getOneFileInfo<T>(query, bucketName?:string): Promise<T> {
        bucketName=bucketName||Repository._bucketName;
        return Repository.getOne<T>(`${bucketName}.files`, query);
    }
    public static getManyFileInfo<T>(query, bucketName?:string): Promise<T[]> {
        bucketName=bucketName||Repository._bucketName;
        return Repository.getMany<T>(`${bucketName}.files`, query);
    }
    
    public static createFileFromPath<T>(path: string | Buffer, folderAndFilename, extraData?:any, bucketName?:string): Promise<T> {
        bucketName=bucketName||Repository._bucketName;
        return new Promise((resolve, reject) => {
            let query = { filename: folderAndFilename };

            try {
                if(!folderAndFilename)  throw new Error('Output file name must be specified');
                if (!path) throw new Error('File name was null');
                folderAndFilename=folderAndFilename.split('?')[0];
                Repository.beginUploadProcess(path, folderAndFilename, bucketName).then((fileInfo:{_id:ObjectID}) => {
                   if(fileInfo && extraData){
                       let id=fileInfo._id.toHexString();
                        Repository.updateFileMetaData(id, extraData, bucketName).then((info)=>{
                            return resolve(Object.assign(fileInfo, info));
                        }).catch(err=>{
                            return resolve(fileInfo);
                        });
                   }else{
                   return resolve(fileInfo);
                   }
                }).catch(err => {
                   return reject(err);
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    public static updateFileMetaData<T>(folderAndFilename_or_id, data, bucketName?:string): Promise<T> {
          bucketName=bucketName||Repository._bucketName;
        return new Promise((resolve, reject) => {
            let file_id = folderAndFilename_or_id;
            let query: any = { filename: file_id };
            try {
                query = { _id: ObjectID.createFromHexString(file_id) };
            } catch (error) { }
            try {
                console.log('Metadata', data, query, bucketName);
                Repository.updateOne<any>(`${bucketName}.files`, query,  data ).then(updated => {
                    Repository.getOneFileInfo(query, bucketName).then(fileInfo => {
                        resolve(fileInfo);
                    }).catch(err => {
                        reject(err);
                    })
                }).catch(err => {
                    reject(err);
                });

            } catch (error) {
                return reject(error);
            }
        })
    }
    public static renameFile<T>(id, newFilename, bucketName?:string): Promise<T> {
          bucketName=bucketName||Repository._bucketName;
        return new Promise((resolve, reject) => {
            try {
                if(!newFilename) return new Error('New file name not specifed')
                 let file_id = id;
            let query: any = { _id: file_id };
            try {
                query = { _id: ObjectID.createFromHexString(file_id) };
            } catch (error) { }
           
                newFilename=newFilename.split('?')[0];
                Repository.getBucket(bucketName).rename(query._id, newFilename, (err) => {
                    if (err) {
                        console.log('Unable to rename file with id',  id);
                        return reject(err);
                    }
                    Repository.getOneFileInfo(query, bucketName).then(fileInfo => {
                        resolve(fileInfo);
                    }).catch(err => {
                        console.log('Unable to get detail after renaming file with id', query._id);
                        reject(err);
                    })
                })

            } catch (error) {
                console.log('Unknown error while renaming file with id', id);
                return reject(error);
            }
        })
    }
    public static deleteFile<T>(id, bucketName?:string): Promise<T> {
        bucketName=bucketName||Repository._bucketName;
        return new Promise((resolve, reject) => {
            let file_id = id;
            let query: any = { _id: file_id };
            try {
                query = { _id: ObjectID.createFromHexString(file_id) };
            } catch (error) { }
            try {
                Repository.getBucket(bucketName).delete(query._id, (err) => {
                    if (err) {
                        console.log('Unable to delete file with id', query._id);
                        return reject(err);
                    }
                    resolve({deleted:true});
                })

            } catch (error) {
                console.log('Unknown error while deleting file with id', query._id);
                return reject(error);
            }
        })
    }

    private static beginUploadProcess(path, folderAndFilename, bucketName?:string) {
        bucketName=bucketName||Repository._bucketName;
        return new Promise((resolve, reject) => {
            let bucket= Repository.getBucket(bucketName);
            let bucketStream = bucket.openUploadStream(folderAndFilename);
            fs.createReadStream(path).
                pipe(bucketStream).
                on('error', (error) => {
                    reject(error);
                }).
                on('finish', () => {
                    console.log(`${folderAndFilename} upload complete.`);
                    Repository.getOneFileInfo({ filename: folderAndFilename }, bucketName)
                        .then((file) => {
                            console.log(`Found uploaded info.`);
                            return resolve(file);
                        }).catch(err => {
                            console.log(`Unable to get uploaded info.`);
                            return reject(err);
                        })
                });
        })
    }
    private static mkdirRecursive(targetDir) {
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(parentDir, childDir);
            if (!fs.existsSync(curDir)) {
                fs.mkdirSync(curDir);
            }

            return curDir;
        }, initDir);
    }
}

