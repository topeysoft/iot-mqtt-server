import { AutomationEffect } from "./automation-effect";
import { BaseModel } from "../base";

export class Automation extends BaseModel{
    trigger:string;
    effects: AutomationEffect[]
    
}

