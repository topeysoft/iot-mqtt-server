import * as fs from 'fs';
import * as path from 'path';
let shortid = require('shortid');
import { Repository } from '../repository/repository';
import * as express from 'express';
import { Response, Request } from 'express';
import { OK, BAD_REQUEST, INTERNAL_SERVER_ERROR, CREATED, MULTI_STATUS } from "http-status-codes";
import { ObjectID } from "mongodb";
export class FileServer {
    static tempPath: string;
    private static instance: FileServer;
    /**
     *
     */
    constructor(tempFolder?: string) {
        FileServer.tempPath = tempFolder || './upload-temp/';
        this.init();
        this.setupRoutes();
        FileServer.instance = this;
    }

    private baseUrl = '/';
    private routePaths;
    private expressApp;

    private init() {
        this.expressApp = express();
        this.routePaths = {
            viewUrl: `${this.baseUrl}view`,
            view: `${this.baseUrl}view/*`,
            getAll: `${this.baseUrl}`,
            getOne: `${this.baseUrl}:file_id`,
            create: `${this.baseUrl}`,
            replace: `${this.baseUrl}:file_id`,
            update: `${this.baseUrl}:file_id`,
            delete: `${this.baseUrl}:file_id`
        };
        this.mkdirIfNotExisting(FileServer.tempPath);
    }
    private setupRoutes() {
        this.expressApp.get(this.routePaths.view, this.viewFile);
        this.expressApp.get(this.routePaths.getAll, this.getAllFiles)
        this.expressApp.get(this.routePaths.getOne, this.getOneFile)
        this.expressApp.post(this.routePaths.create, this.createFile)
        this.expressApp.put(this.routePaths.replace, this.renameFile)
        this.expressApp.patch(this.routePaths.update, this.updateFileMetaData)
        this.expressApp.delete(this.routePaths.delete, this.deleteFile)
    }

    private mkdirIfNotExisting = (dir) => {
        try {
            fs.mkdirSync(dir);
        } catch (err) {
            return;
        }
    };

    private getFileUrl(fileInfo, req) {
        return `${req.protocol}://${req.headers.host}/file-api/view/${fileInfo.filename}`;
    };
    viewFile(req: Request, resp: Response) {
        try {
            let file_id = req.url.replace('/view/', '');
            let query: any = { filename: file_id };
            let tempFilePath = FileServer.tempPath;

            try {
                query = { _id: ObjectID.createFromHexString(file_id) };
            } catch (error) { }

            Repository.getFileData(query, tempFilePath).then((tempFileName: any) => {
                console.log('sending file ', tempFileName);
                resp.status(OK).sendFile(tempFileName);
            }).catch(err => {
                resp.status(INTERNAL_SERVER_ERROR).send(err);
            });
        } catch (error) {
            resp.status(BAD_REQUEST).send(error);
        }
    }

    getAllFiles(req: Request, resp: Response) {
        Repository.getManyFileInfo({}).then((data: any) => {
            if (data && data.length > 0) {
                data.map(d => {
                    d.url = FileServer.instance.getFileUrl(d, req);
                })
            }
            resp.status(OK).send(data);
        }).catch(err => {
            resp.status(BAD_REQUEST).send(err);
        });
    }
    getOneFile(req: Request, resp: Response) {
        try {
            let id = null;
            try {
                id = new ObjectID(req.params.file_id)
            } catch (error) {
                throw new Error('Invalid file id');
            }
            Repository.getOneFileInfo({ _id: id }).then((data: any) => {
                if (data) {
                    data.url = FileServer.instance.getFileUrl(data, req);
                }
                resp.status(OK).send(data);
            }).catch(err => {
                resp.status(INTERNAL_SERVER_ERROR).send(err);
            });
        } catch (error) {
            resp.status(BAD_REQUEST).send(error.message);
        }
    }
    createFile(req: any, resp: Response) {
        try {
            var dir = req.body.folder || '';
            var files = req.files;
            if (!files) throw new Error('No files to upload');
            var keys: string[] = Object.keys(files);
            var pendingFileArray = [];
            keys.forEach(key => {
                var file = files[key];
                if (file.constructor === Array) {
                    file.forEach(f => {
                        pendingFileArray.push(f);
                    });
                }
                else {
                    pendingFileArray.push(file);
                }
            });
            var filePending = pendingFileArray.length;

            var uploadResult = [];
            var allDone = (uResult: any[], res: Response, tempFileName?: string) => {
                console.log('Upload result', uploadResult);
                if (tempFileName) {
                    console.log(`Doing some clean up for '${tempFileName}'`)
                    fs.unlink(tempFileName, (err) => {
                        if (err) {
                            console.log(`Unable to remove temp file '${tempFileName}'.`);
                        } else {
                            console.log(`Temp file '${tempFileName}' cleaned up.`);
                        }
                    });
                }
                if (!--filePending) {

                    if (!uResult || uResult.length < 0) return res.sendStatus(BAD_REQUEST);
                    if (uResult.every(r => { return r.success; })) {
                        return res.status(CREATED).send(uResult);
                    } else if (uResult.find(r => { return r.success })) {
                        return res.status(MULTI_STATUS).send(uResult);
                    } else {
                        return res.sendStatus(BAD_REQUEST);
                    }
                }
            }
            pendingFileArray.forEach(file => {
                var filePath = path.join(dir, file.name).split('\\').join('/');
                var fileResult: any = { file_name: file.name };
                console.log('Saving to temp folder: ', { name: file.name });
                let tempFileName = path.join(FileServer.tempPath, `${file.name}`);
                file.mv(tempFileName, (err) => {
                    if (err) {
                        let message = 'Unable to prepare file for DB write';
                        console.log(message, err);
                        throw new Error(message);
                    }
                    console.log('Saving to DB: ', { name: file.name });
                    Repository.createFileFromPath<any>(tempFileName, filePath).then(result => {
                        fileResult.success = true;
                        if (result) {
                            result.url = FileServer.instance.getFileUrl(result, req);
                        }
                        fileResult.data = result;
                        uploadResult.push(fileResult);
                        allDone(uploadResult, resp, tempFileName);
                    }).catch(err => {
                        fileResult.success = false;
                        fileResult.data = err;
                        uploadResult.push(fileResult);
                        allDone(uploadResult, resp, tempFileName);
                    });
                })

            });
        } catch (err) {
            console.log('ERROR 400', err);
            resp.status(BAD_REQUEST).send(err.message);
        }

    }
    renameFile(req: Request, resp: Response) {
        Repository.renameFile(req.params.file_id, req.body.new_filename)
            .then(renamed => {
                resp.json(renamed);
            }).catch(err => {
                console.log('Unable to rename file ', err);
                resp.status(BAD_REQUEST);
            })
    }
    updateFileMetaData(req: Request, resp: Response) {
        Repository.updateFileMetaData(req.params.file_id, req.body)
            .then(updated => {
                resp.json(updated);
            }).catch(err => {
                console.log('Unable to update file metadata', err);
                resp.status(BAD_REQUEST);
            });
    }
    deleteFile(req: Request, resp: Response) {
        Repository.deleteFile(req.params.file_id)
            .then(deleted => {
                resp.json(deleted);
            }).catch(err => {
                console.log('Unable to delete file ', err);
                resp.status(BAD_REQUEST);
            });
    }

    public getApp() {
        return this.expressApp;
    }


}


// var fileId = new ObjectID();
// var gridStore = new GridStore(db, fileId, "w", {root:'fs'});
// gridStore.chunkSize = 1024 * 256;

// gridStore.open(function(err, gridStore) {
//  Step(
//    function writeData() {
//      var group = this.group();

//      for(var i = 0; i < 1000000; i += 5000) {
//        gridStore.write(new Buffer(5000), group());
//      }
//    },

//    function doneWithWrite() {
//      gridStore.close(function(err, result) {
//        console.log("File has been written to GridFS");
//      });
//    }
//  )
// });