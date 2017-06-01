import { DevConfig } from './config.dev';
import { ProdConfig } from './config.prod';
import * as fs from 'fs';
import * as path from 'path';
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

    private static configPath: string =path.resolve(`./configurations/${process.env.NODE_ENV}.json`);

    private static configData: any = {};

    private static fetchConfig() {
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(ConfigManager.configPath, 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        let config: any = JSON.parse(data);
                        ConfigManager.configData=config;
                        return resolve(config);
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    static get(key) {
        return ConfigManager.getConfig()[key];
    }
    static init() {
        return new Promise((resolve, reject) => {
            fs.watchFile(ConfigManager.configPath, (curr, prev) => {
                console.info('Config updated');
                ConfigManager.fetchConfig().then(config => {
                    resolve(config)
                }).catch(err => {
                    console.error('Unable to get app config', err);
                    reject(err);
                });
            });
        })
    }
}