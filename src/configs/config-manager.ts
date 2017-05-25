import { DevConfig } from './config.dev';
import { ProdConfig } from './config.prod';
export class ConfigManager {
    static getConfig() {
        var env = process.env.NODE_ENV || 'development';
        switch (process.env.NODE_ENV) {
            case 'development':
                return DevConfig;
            case 'production':
                return ProdConfig;
            default:
                return DevConfig;
        }
    }
}