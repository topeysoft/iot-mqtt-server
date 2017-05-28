import { Express, Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from 'http-status-codes';

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const urlParser = require('url');
export class Authorize {
    /**
     *
     */
    constructor(app: Express) {
        this.setup(app);
    }

    private setup(app: Express) {
        var auth=jwt({
            secret: "B8Wbhz81Gar4dr9xzhTvXUJOzHmTCteT8dkl98YYCjDX46SCd7a3tb-UO-nUXuTE",
            credentialsRequired: false,
            getToken: function fromHeaderOrQuerystring(req: Request) {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    return req.headers.authorization.split(' ')[1];
                } else if (req.query && req.query.token) {
                    return req.query.token;
                }
                return null;
            },
            audience: 'wTqZC92ef4HThbA8muZsA8LI66ddYji3',
            issuer: "https://topeysoft.auth0.com/",
            algorithms: ['HS256']
        });
       // app.use(auth);

        app.use((err, req: Request, resp: Response, next: NextFunction) => {
            if (err && err.name === 'UnauthorizedError') {
                resp.send(401, err.message);
            } else {
                next(err);
            }
        })

    }

}

export const authorizeRoute = () => {
    return (req: Request, resp: Response, next: NextFunction) => {
      if(1===1) {
          req.user=req.user||{};
          req.user.is_super_user=true;
          console.log('EXITING AUTH');
           return next();
      }
        var params = req.path.split('/');
        var project_id = req.params.project_id;

        try {
            var user = req.user;
            console.log("USER", user);
            console.log("PARAMS", req.params);

            var apps: any[] = user.apps;
            var path = req.originalUrl.trim().replace(/\/$/, "");
            var is_auth = false;
            if (!apps) throw new Error('User does not have any app/project configured');
            if ((!project_id && path !== '/api/projects')) throw new Error('No app/project is specified');
            apps.forEach(app => {
                var app_data = app.split('|');
                if (app_data) {
                    if ((app_data[0] && app_data[0] === project_id)
                        || (app_data[1] && app_data[1] === project_id)
                        || (app === 'projects|list' && path === '/api/projects')
                    ) {
                        is_auth = true;
                        console.log("USER access", app_data[0], app_data[1]);
                        return;
                    }
                }
            });
            if (is_auth) return next();
            throw new Error('This requested project does not match user access');
        } catch (err) {
            console.error(err.message)
            return resp.sendStatus(UNAUTHORIZED);
        }
    };
}