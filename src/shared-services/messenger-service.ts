
import { EventEmitter } from "events";

export class MessengerService extends EventEmitter {
    /**
     *
     */
   static get instance():MessengerService{
        MessengerService._instance = MessengerService ._instance || new MessengerService;
        return MessengerService._instance;
   }
   
  private static  _instance:MessengerService;
    // static send(tag:string, payload:any){
        
    // }
    // static listen(tag, handler){

    // }
}