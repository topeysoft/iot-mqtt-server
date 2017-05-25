"use strict";
const config_dev_1 = require('./config.dev');
const config_prod_1 = require('./config.prod');
class ConfigManager {
    static getConfig() {
        var env = process.env.NODE_ENV || 'development';
        switch (process.env.NODE_ENV) {
            case 'development':
                return config_dev_1.DevConfig;
            case 'production':
                return config_prod_1.ProdConfig;
            default:
                return config_dev_1.DevConfig;
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config-manager.js.map