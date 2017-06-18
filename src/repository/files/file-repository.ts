import { ConfigManager } from '../../configs/config-manager';
var fs = require('file-system');
var path = require('path');
const jetpack = require('fs-jetpack');
export class FileRepository {

    private config: any;
    private baseFilePath: any;
    private baseFileUrl: any;
    /**
     *
     */
    constructor() {
        this.config = ConfigManager.getConfig();
        this.baseFilePath = this.config.file_upload.files_base_path;
        this.baseFileUrl = this.config.file_upload.files_base_url;
    }
    getDirectoryRecursive(dir: string) {
        return new Promise((resolve, reject) => {
            var d = this.sanitizeFullPathName(dir);
            console.log("PATH", d);
            jetpack.inspectTreeAsync(d, { relativePath: true })
                .then(fileData => {
                    resolve(this.convertPathsToUrl(fileData, this.sanitizePathName(dir)));
                }).catch(err => {
                    reject(err);
                })
        })
    }
    getFileInfo(dir: string) {
        return new Promise((resolve, reject) => {
            var d = this.sanitizeFullFilePath(dir);
            console.log("PATH", d);
            var exists = jetpack.exists(d);
            if (exists && exists === 'file') {
                jetpack.inspectAsync(d).then(fileData => {
                    var url = this.convertAbsolutePathToUri(this.baseFilePath, d);
                    fileData.url = url;
                    resolve(fileData);
                }).catch(err => {
                    reject(err);
                });
            } else {
                reject('Invalid file name');
            }
        })
    }
    getFileInfoSync(dir: string) {
        console.log("ORIGINAL_PATH", dir);
        var d = this.sanitizeFullFilePath(dir);
        console.log("PATH", d);
        var exists = jetpack.exists(d);
        var fileData = null;
        if (exists && exists === 'file') {
            fileData = jetpack.inspect(d);
            var url = this.convertAbsolutePathToUri(this.baseFilePath, d);
            fileData.url = url;
        } 
        return fileData;

    }
    createDirectory(dir: string) {
        return new Promise((resolve, reject) => {
            var d = this.sanitizeFullPathName(dir);
            fs.mkdir(d, (err, list) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(list);
                }
            })
        })
    }
    renameDirectory(dir: string, newName) {
        return new Promise((resolve, reject) => {
            var d = this.sanitizeFullPathName(dir);
            newName = path.resolve(d, '..', this.sanitizePathName(newName));
            fs.rename(d, newName, (err, list) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(list);
                }
            });
        })
    }
    removeDirectory(dir: string) {
        var d = this.sanitizeFullPathName(dir);
        var promise = jetpack.removeAsync(d);
        return promise;
    }

    sanitizeFullFilePath(dir) {
        dir = dir || '';
        var pathname = path.dirname(dir);
        var fileName = path.basename(dir);
        pathname = pathname.trim();
        var d = `${this.baseFilePath}/${pathname}/${fileName}`;

        d = d.split('\\').join('/');
        d = d.split('//').join('/');
        return d;
    }
    sanitizeFullPathName(dir) {
        dir = dir || '';
        var d = dir.trim().split('.').join('');
        d = `${this.baseFilePath}/${d}`;

        d = d.split('\\').join('/');
        d = d.split('//').join('/');
        return d;
    }

    sanitizeFilePath(dir) {
        dir = dir || '';
        dir = this.sanitizeFullFilePath(dir);
        var d = dir.trim();
        return d;
    }
    sanitizeFileName(dir) {
        dir = dir || '';
        dir = path.basename(dir);
        var d = dir.trim();
        return d;
    }
    sanitizePathName(dir) {
        dir = dir || '';
        var d = dir.trim().split('.').join('');
        d = d.split('\\').join('/');
        d = d.split('//').join('/');
        //        d=path.normalize(d);
        return d;
    }
    private convertPathsToUrl(fileObj: any, basePath: string, removeRelative = false) {
        try {
            if (!fileObj) return fileObj;
            var url = this.replaceRelativePathWithUrl(basePath, fileObj.relativePath);
            fileObj.url = url;
            try {
                if (removeRelative) {
                    delete fileObj.relativePath;
                }
            } catch (err) { }
            if (!fileObj.children || fileObj.children.length < 1) return fileObj;
            fileObj.children.forEach(child => {
                if (child.children) {
                    this.convertPathsToUrl(child, basePath, removeRelative)
                } else {
                    child.url = this.replaceRelativePathWithUrl(basePath, child.relativePath);
                }
            })
        } catch (err) {
            console.log(err.message);
        }
        return fileObj;
    }

    private replaceRelativePathWithUrl(base: string, rel: string) {
        var uri = path.join(base, rel);
        uri = uri.split('\\').join('/');
        uri = uri.split('//').join('/');
        return { url: `${this.baseFileUrl}${uri}`, uri: uri };
    }
    private convertAbsolutePathToUri(base: string, abs: string) {
        abs = abs.split('\\').join('/');
        abs = abs.split('//').join('/');
        base = base.split('\\').join('/');
        base = base.split('//').join('/');
        var uri = abs.split(base).join('/');
        uri = uri.split('//').join('/');
        return { url: `${this.baseFileUrl}${uri}`, uri: uri };
    }
}