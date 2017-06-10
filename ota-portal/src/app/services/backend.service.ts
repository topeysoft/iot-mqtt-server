import {ConfigManager} from '../../../../src/configs/config-manager';
import {Http} from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class BackendService {

constructor(private client:Http) { }

config=ConfigManager.get('api');
getManifest(){
    return new Promise((resolve, reject)=>{
        let url=`${this.config['base_url']}/manifest`;
        this.client.get(url).subscribe(
            resp=>{
                resolve(resp.json);
            },
            error=>{
                reject(error);
            }
        )
    });
}
}