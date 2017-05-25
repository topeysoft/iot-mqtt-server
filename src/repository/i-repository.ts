import { RepoQueryParams } from './repo-query-params';
export interface IRepository {
    // initialize(urlOrPath: string, force: boolean);
     getOne<T>(collectionName: string, query): Promise<T>;
     getMany<T>(collectionName: string, queryParams: RepoQueryParams | any): Promise<T[]>;
     insertOne<T>(collectionName: string, doc: T): Promise<any>;
     insertMany<T>(collectionName: string, docs: T[]): Promise<any>;

     updateOne<T>(collectionName: string, filter, doc: T, options, action, setDate): Promise<any>;
     updateMany<T>(collectionName: string, filter, doc: T, options?): Promise<any>;

     deleteOne<T>(collectionName: string, filter): Promise<any>;
     deleteMany<T>(collectionName: string, filter): Promise<any>;
     exists<T>(collectionName: string, filter): Promise<boolean>;
}

