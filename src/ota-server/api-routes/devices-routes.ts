import { NextFunction, Request, Response, Router } from 'express';
import { Repository } from '../../repository/repository';
import { ObjectID } from 'mongodb';
import { SmartDevice } from '../../models/smart-devices';
import { RepoQueryParams } from '../../repository/repo-query-params';
export class DevicesApiRoute {

  private basePath: string = '/devices';
  constructor(private router: Router) {
    this.getRoutes();
    this.postRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }
  private postRoutes() {
    this.router.post(`${this.basePath}`, (req, res) => {
      this.createDevice(req, res);
    });
  }
  private putRoutes() {
    this.router.put(`${this.basePath}/:device_id`, (req, res) => {
      this.updateDevice(req, res);
    });
  }
  private patchRoutes() {
    this.router.patch(`${this.basePath}/:device_id`, (req, res) => {
      this.partiallyUpdateDevice(req, res);
    });
  }
  private deleteRoutes() {
    this.router.delete(`${this.basePath}/:device_id`, (req, res) => {
      this.deleteDevice(req, res);
    });
  }
  private getRoutes() {
    this.router.get(`${this.basePath}`, (req, res) => {
      this.getManyDevices(req, res);
    });
    this.router.get(`${this.basePath}/:device_id`, (req, res) => {
      this.getOneDevice(req, res);
    });
  }

  private getManyDevices(req: Request, res: Response) {
    req.query=req.query||{};
    var fields:string=req.query['fields']||'';
    var queryParams:RepoQueryParams = req.query;
    queryParams.skip=+queryParams.skip||0;
    queryParams.limit=+queryParams.limit||1000;
    queryParams.fields={};
    fields.split(',').concat(fields.split('|')).filter(s=>{
      return (s && s.trim().length>0)
    });
    Repository.getMany('devices',queryParams).then((devices)=>{
      res.json(devices);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    });
  }
  private getOneDevice(req: Request, res: Response) {
    var id=req.params.device_id;
    var filter:any={$or:[{device_id:id}]};
    try{
      filter.$or.push({_id:new ObjectID(id)});
    }catch(e){}
    
     Repository.getOne('devices',filter).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    })
  }
  private createDevice(req: Request, res: Response) {
     var device:SmartDevice = req.body;
     Repository.insertOne('devices', device).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    })
  }
  private updateDevice(req: Request, res: Response) {
     var device:SmartDevice = req.body;
      var id=req.params.device_id;
    var filter:any={$or:[{device_id:id}]};
    try{
      filter.$or.push({_id:new ObjectID(id)});
    }catch(e){}
     Repository.updateOne('devices',filter,device).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    })
  }
  private partiallyUpdateDevice(req: Request, res: Response) {
    var device:SmartDevice = req.body;
    var id=req.params.device_id;
    var filter:any={$or:[{device_id:id}]};
    try{
      filter.$or.push({_id:new ObjectID(id)});
    }catch(e){}
     Repository.updateOne('devices',filter,device).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    })
  }
  private deleteDevice(req: Request, res: Response) {
    var id=req.params.device_id;
    var filter:any={$or:[{device_id:id}]};
    try{
      filter.$or.push({_id:new ObjectID(id)});
    }catch(e){}
    
    Repository.deleteOne('devices',filter).then((result)=>{
      res.json(result);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    });
  }
}

