import { NextFunction, Router, Request, Response, Express } from 'express';
import { DevicesApiRoute } from './devices-routes';
import { authenticationMiddleware } from '../../middlewares/security/authentication/authentication-middleware';
import { OK, UNAUTHORIZED } from "http-status-codes";
import { RoomsApiRoute } from './rooms-routes';
import { NodesApiRoute } from './nodes-routes';
export class ApiRoutes {
    constructor(app: Express, basePath: string = '/api') {
        var router = Router();
        router.get('/', function (req: Request, res: Response) {
            res.json({ message: 'Welcome to our api!' });
        });
        new DevicesApiRoute(router);
        new NodesApiRoute(router);
        new RoomsApiRoute(router);
       var response:Response;

        // app.use(authenticationMiddleware((req:Request, resp:Response, next:NextFunction)=>{
        //     resp.status(UNAUTHORIZED).send('Access denied');
        // }));
        app.use(basePath, router);
    }

}