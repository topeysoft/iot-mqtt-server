
import { DevConfig } from 'configs/config.dev';
import { ProdConfig } from 'configs/config.prod';
import { environment } from 'environments/environment';

export module ConfigManger{
   export function getConfig():any{
        if(environment.production){
            warnUserOfConsolePredicament();
            return ProdConfig;
        }else{
            return DevConfig;
        }
    }
   export function get(configKey):any{
      let config = getConfig()||[];
      return config[configKey];
    }
   
   function warnUserOfConsolePredicament(){
       console.error("PLEASE STOP! \n You have no reason to use this feature.");
   }
}