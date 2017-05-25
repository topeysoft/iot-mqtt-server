"use strict";
const mongodb_1 = require("mongodb");
class Repository {
    static initialize(connectionUrl, force = false) {
        if (!Repository._db || force) {
            mongodb_1.MongoClient.connect(connectionUrl, (err, database) => {
                if (err)
                    return console.error("MongoDB Connection error:", err.message);
                Repository._db = database;
            });
        }
    }
    /**
     *
     */
    static getOne(collectionName, query) {
        return Repository._db.collection(collectionName).findOne(query);
    }
    static getMany(collectionName, queryParams) {
        return Repository._db.collection(collectionName).find(queryParams.query, queryParams.fields, queryParams.skip, queryParams.limit).toArray();
    }
    static insertOne(collectionName, doc) {
        return Repository._db.collection(collectionName).insertOne(doc);
    }
    static insertMany(collectionName, docs) {
        return Repository._db.collection(collectionName).insertMany(docs);
    }
    static updateOne(collectionName, filter, doc, options = {}, action = '$set', setDate = true) {
        var update = {};
        update[action] = doc;
        if (setDate)
            update['$currentDate'] = { lastModified: true };
        return Repository._db.collection(collectionName).updateOne(filter, update, options);
    }
    // public static updateOneSubDoc(collectionName: string, filter, subDoc, options={}): Promise<UpdateWriteOpResult> {
    //   var update = {
    //         $push:subDoc,
    //     }
    //     return Repository._db.collection(collectionName).updateOne(filter, update, options);
    // }
    static updateMany(collectionName, filter, doc, options) {
        return Repository._db.collection(collectionName).updateMany(filter, doc);
    }
    static deleteOne(collectionName, filter) {
        return Repository._db.collection(collectionName).deleteOne(filter);
    }
    static deleteMany(collectionName, filter) {
        return Repository._db.collection(collectionName).deleteMany(filter);
    }
    static exists(collectionName, filter) {
        return new Promise((resolve, reject) => {
            Repository._db.collection(collectionName).count(filter)
                .then((count) => resolve(count > 0))
                .catch((error) => reject(error));
        });
    }
}
exports.Repository = Repository;
class RepoQueryParams {
    constructor() {
        this.query = {};
        this.fields = {};
        this.skip = 0;
        this.limit = 1000;
    }
}
exports.RepoQueryParams = RepoQueryParams;
//# sourceMappingURL=repository.js.map