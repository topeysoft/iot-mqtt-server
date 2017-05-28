import { NextFunction, Request, Response } from 'express';
export const AllowOauth2ParamsInHeader = function(){
    return function(req:Request, resp:Response, next:NextFunction){
        if(req.get('client_id') && !req.query.client_id) req.query.client_id=req.get('client_id');
        if(req.get('client_secret') && !req.query.client_secret) req.query.client_secret=req.get('client_secret');

        return next();
    }
}