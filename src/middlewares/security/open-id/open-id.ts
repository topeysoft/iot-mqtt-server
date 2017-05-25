import { Passport } from 'passport';
import { ConfigManager } from '../../../configs/config-manager';
var OpenIDStrategy = require('passport-openid-connect').Strategy;

export class PassportOpenIdMiddleware {
    config:any;
    constructor(passport: Passport) {
        this.config =ConfigManager.getConfig();
        passport.use(new OpenIDStrategy({
            returnURL: this.config.security.openId.returnUrl, // 'http://www.example.com/auth/openid/return',
            realm:  this.config.security.openId.realm //'http://www.example.com/'
        },
            function (identifier, done) {
                var user = {}, err = new Error();
                // User.findOrCreate({ openId: identifier }, function(err, user) {
                done(err, user);
                // });
            }
        ));
    }
}