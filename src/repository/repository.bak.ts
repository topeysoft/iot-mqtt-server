
//import * as loki from 'lokijs';

import { MongoClient, MongoError, Db, InsertOneWriteOpResult, InsertWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject, FindOneOptions } from "mongodb";
import { IRepository } from './i-repository';
import { RepositoryType } from './repository-types';
import { RepoQueryParams } from './repo-query-params';
import { TingoRepository } from './repository.tingo';
import { MongoRepository } from './repository.mongo';
export class Repository {

    private static _repo: IRepository;
    //  private static _dbArray: Db | any;

    static initialize(urlOrPath: string, type: RepositoryType = RepositoryType.TingoDB, force: boolean = false) {

        switch (type) {
            case RepositoryType.TingoDB:
                Repository._repo = TingoRepository.getRepository(urlOrPath, force);
                break;
            case RepositoryType.MongoDb:
                Repository._repo = MongoRepository.getRepository(urlOrPath, force);
                break;
            default:
                Repository._repo = MongoRepository.getRepository(urlOrPath, force);
                break;
        }
    }
    public static getOne<T>(collectionName: string, query): Promise<T> {
        return Repository._repo.getOne<T>(collectionName, query);
    }
    public static getMany<T>(collectionName: string, queryParams: RepoQueryParams | any): Promise<T[]> {
        return Repository._repo.getMany<T>(collectionName, queryParams);
    }

    
    public static insertOne<T>(collectionName: string, doc: T): Promise<InsertOneWriteOpResult> {
        return Repository._repo.insertOne<T>(collectionName, doc);
    }
    public static insertMany<T>(collectionName: string, docs: T[]): Promise<InsertWriteOpResult> {
        return Repository._repo.insertMany<T>(collectionName, docs);
    }

    public static updateOne<T>(collectionName: string, filter, doc: T, options = {}, action = '$set', setDate = true): Promise<UpdateWriteOpResult> {
        return Repository._repo.updateOne<T>(collectionName, filter, doc, options, action, setDate);
    }

    public static updateMany<T>(collectionName: string, filter, doc: T, options?): Promise<UpdateWriteOpResult> {
        return Repository._repo.updateMany<T>(collectionName, filter, doc, options);
    }

    public static deleteOne<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return Repository._repo.deleteOne<T>(collectionName, filter);
    }
    public static deleteMany<T>(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
        return Repository._repo.deleteMany<T>(collectionName, filter);
    }
    public static exists<T>(collectionName: string, filter): Promise<boolean> {
        return Repository._repo.exists<T>(collectionName, filter);
    }
}

