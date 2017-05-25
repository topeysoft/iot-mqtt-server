import { NextFunction, Request, Response, Router } from 'express';
import { DeviceRepository } from '../../repository/devices/devices-repo';
import { ObjectID } from 'mongodb';
import { SmartDevice } from '../../models/smart-devices';
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
    var queryParams:{skip:number, limit:number} = req.query;
    var skip=queryParams.skip||0;
    var limit=queryParams.limit||1000;
    skip=parseInt(skip+'');
    limit=parseInt(limit+'');
    var fields={};
    DeviceRepository.getMany({}, fields, skip, limit).then((devices)=>{
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
    
     DeviceRepository.getOne(filter).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    })
  }
  private createDevice(req: Request, res: Response) {
     var device:SmartDevice = req.body;
     DeviceRepository.upsert(device).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    })
  }
  private updateDevice(req: Request, res: Response) {
     var device:SmartDevice = req.body;
     DeviceRepository.upsert(device).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    })
  }
  private partiallyUpdateDevice(req: Request, res: Response) {
    var device:SmartDevice = req.body;
     DeviceRepository.upsert(device).then((device)=>{
      res.json(device);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    });
  }
  private deleteDevice(req: Request, res: Response) {
    var id=req.params['device_id'];
    DeviceRepository.delete(id).then((result)=>{
      res.json(result);
    })
    .catch((err)=>{
      console.log(err);
      res.sendStatus(500);
    });
  }
}

