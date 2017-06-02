import { DevConfig } from './config.dev';
import { ProdConfig } from './config.prod';
import * as fs from 'fs';
import * as path from 'path';
export class ConfigManager {
    static getConfig() {
        return ConfigManager.configData;
        // process.env.NODE_ENV = process.env.NODE_ENV || 'development';
        // switch (process.env.NODE_ENV) {
        //     case 'development':
        //         return DevConfig;
        //     case 'production':
        //         return ProdConfig;
        //     default:
        //         return DevConfig;
        // }
    }

    private static configPath: string = path.resolve(`./configurations/${process.env.NODE_ENV || 'development'}.json`);

    private static configData: any = {};

    private static fetchConfig() {
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(ConfigManager.configPath, 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        let config: any = JSON.parse(data);
                        ConfigManager.configData = config;
                        return resolve(config);
                    }
                });
            } catch (error) {
                reject(error);
            }
        })
    }
    private static fetchConfigSync() {
        try {
            var data = fs.readFileSync(ConfigManager.configPath, 'utf8');
            let config: any = JSON.parse(data);
            ConfigManager.configData = config;
            return config;
        } catch (error) {
            console.log('Unable to get config file', error);
        }
    }

    static get(key) {
        return ConfigManager.getConfig()[key];
    }
    static initSync() {
        ConfigManager.fetchConfigSync();
        ConfigManager.watchConfig();
    }
    static init() {
        return new Promise((resolve, reject) => {
            ConfigManager.fetchConfig().then(config => {
                ConfigManager.watchConfig();
                resolve(config);
            }).catch(err => {
                reject(err);
            })
        })
    }

    private static watchConfig() {
        fs.watchFile(ConfigManager.configPath, (curr, prev) => {
            console.info('Config updated');
            ConfigManager.fetchConfig().then(cfg => {
                console.log('Update to config successfully loaded')
            })
                .catch(err => {
                    console.log('Unable to load config after update');
                });
        });
    }
}