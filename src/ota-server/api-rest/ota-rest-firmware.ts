import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import { Express, Request, Response } from 'express';
import { Repository } from "./../../repository/repository";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, MULTI_STATUS, CREATED } from "http-status-codes";
import { ObjectID } from "mongodb";
export class FirmwareApiRoutes {
    private routePaths: any;
    static tempFilePath='firmwares-temp-path';
    constructor() {
        this.expressApp = express();
        this.routePaths = {
            getAll:  `${this.basePath}`,
            getOne:  `${this.basePath}:firmware_id`,
            create:  `${this.basePath}`,
            replace: `${this.basePath}:firmware_id`,
            update:  `${this.basePath}:firmware_id`,
            delete:  `${this.basePath}:firmware_id`
        };
        this.setup();
    }


    public expressApp: any;
    public basePath = '/';


    deleteFirmware(req:Request, resp:Response){
    
    }
    replaceFirmware(req:Request, resp:Response){
    
    }
    updateFirmwareData(req:Request, resp:Response){
         Repository.updateFileMetaData(req.params.firmware_id, req.body, "firmwares")
            .then(updated => {
                resp.json(updated);
            }).catch(err => {
                console.log('Unable to update file metadata', err);
                resp.status(BAD_REQUEST);
            });
    }
    createFirmware(req:Request|any, resp:Response){
         try {
            var dir = req.body.folder || '';
            var metadata = req.body.matadata;
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
                let tempFileName = path.join(FirmwareApiRoutes.tempFilePath, `${file.name}`);
                file.mv(tempFileName, (err) => {
                    if (err) {
                        let message = 'Unable to prepare file for DB write';
                        console.log(message, err);
                        throw new Error(message);
                    }
                    console.log('Saving to DB: ', { name: file.name });
                    Repository.createFileFromPath<any>(tempFileName, filePath, req.body, 'firmwares').then(result => {
                        fileResult.success = true;
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
    /**
     *
     */


    static getApp(): Express {
        var api = new FirmwareApiRoutes();
        return api.expressApp;
    };
    public setup() {
        this.expressApp.get(this.routePaths.getAll, (req: Request, resp) => {
            return this.getFirmwares(req, resp);
        });
        this.expressApp.get(this.routePaths.getOne, (req, resp) => {
            return this.getFirmwareById(req, resp);
        });
        this.expressApp.post(this.routePaths.create, (req, resp) => {
            return this.createFirmware(req, resp);
        });
        this.expressApp.put(this.routePaths.replace, (req, resp) => {
            return this.replaceFirmware(req, resp);
        });
        this.expressApp.patch(this.routePaths.update, (req, resp) => {
            return this.updateFirmwareData(req, resp);
        });
        this.expressApp.delete(this.routePaths.delete, (req, resp) => {
            return this.deleteFirmware(req, resp);
        });
        this.mkdirIfNotExisting(FirmwareApiRoutes.tempFilePath);
    }

    
    private mkdirIfNotExisting = (dir) => {
        try {
            fs.mkdirSync(dir);
        } catch (err) {
            return;
        }
    };

    getFirmwares(req: Request, resp: Response) {
        return Repository.getManyFileInfo({}, 'firmwares')
            .then((data) => {
                resp.send(data);
            })
            .catch(err => {
                resp.send(INTERNAL_SERVER_ERROR);
            })
    }
    getFirmwareById(req: Request, resp: Response) {
        try {
            let id = new ObjectID(req.params["firmware_id"])
            Repository.getOneFileInfo( { _id: id }, 'firmwares')
                .then((data) => {
                    resp.send(data);
                })
                .catch(err => {
                    resp.send(INTERNAL_SERVER_ERROR);
                })
        } catch (error) {
            resp.send(BAD_REQUEST);
        }
    }

}