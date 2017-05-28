
import { Express } from "express-serve-static-core";
import { ConfigManager } from '../../configs/config-manager';
import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from "http-status-codes";


export const permissions = function (requiredPermissions: string[] = [], allOrNothing: boolean = false) {
    return function (req: Request, resp: Response, next: NextFunction) {
        checkPermissions(req, requiredPermissions, allOrNothing)
            .then(result => {
                return next();
            })
            .catch(err => {
                return resp.sendStatus(UNAUTHORIZED);
            })
    }
}

export const checkPermissions = function (req: Request, requiredPermissions: string[] = [], allOrNothing: boolean = false) {
    return new Promise((resolve, reject) => {
       if(1===1) return resolve();
        var user = req.user || {};
        var userPermissions = req.user.permissions || [];
        if (allOrNothing) {
            if (requiredPermissions.every(s => { return userPermissions.indexOf(s) !== -1 })) {
                return resolve({ hasPermission: true });
            }
        } else {
            var valid = false;
            requiredPermissions.forEach(s => {
                if (userPermissions.indexOf(s) !== -1) {
                    valid = true;
                    return;
                }
            });

            if (valid) {
                return resolve({ hasPermission: true });
            } else {
                return reject({ hasPermission: false });
            }
        }
        return reject({ hasPermission: false });
    })

}

