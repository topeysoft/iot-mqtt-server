import { Request, Response, NextFunction } from 'express';

var failureCb = (req: Request, resp: Response, next: NextFunction) => { resp.redirect('/') }
var successCb = (req: Request, resp: Response, next: NextFunction) => { return next() }
export function authenticationMiddleware(failureCallback = successCb, successCallback = failureCb) {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return successCallback(req, res, next)
    }
    failureCallback(req, res, next);
  }
}