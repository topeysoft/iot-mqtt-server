import { NextFunction, Request, Response, Router } from 'express';
import { Repository } from '../../repository/repository';
import { ObjectID } from 'mongodb';
import { Room } from '../../models/room';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { RepoQueryParams } from '../../repository/repo-query-params';
import { HomieNode } from '../../models/smart-devices';
export class RoomsApiRoute {

  private basePath: string = '/rooms';
  constructor(private router: Router) {
    this.getRoutes();
    this.postRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }
  private postRoutes() {
    this.router.post(`${this.basePath}`, (req, res) => {
      this.createRoom(req, res);
    });
  }
  private putRoutes() {
    this.router.put(`${this.basePath}/:room_id`, (req, res) => {
      this.updateRoom(req, res);
    });
  }
  private patchRoutes() {
    this.router.patch(`${this.basePath}/:room_id`, (req, res) => {
      this.partiallyUpdateRoom(req, res);
    });
  }
  private deleteRoutes() {
    this.router.delete(`${this.basePath}/:room_id`, (req, res) => {
      this.deleteRoom(req, res);
    });
  }
  private getRoutes() {
    this.router.get(`${this.basePath}`, (req, res) => {
      this.getManyRooms(req, res);
    });
    this.router.get(`${this.basePath}/:room_id`, (req, res) => {
      this.getOneRoom(req, res);
    });
  }

  private getManyRooms(req: Request, res: Response) {
    req.query = req.query || {};
    var fields: string = req.query['fields'] || '';
    var queryParams: RepoQueryParams = req.query;
    queryParams.skip = +queryParams.skip || 0;
    queryParams.limit = +queryParams.limit || 1000;
    queryParams.fields = {};
    fields.split(',').concat(fields.split('|')).filter(s => {
      return (s && s.trim().length > 0)
    })
      .forEach(f => {
        queryParams.fields[f] = 1;
      });
    // var query = [
    //   { $unwind: "$control_ids" },
    //   {
    //     $lookup: {
    //       from: "nodes",
    //       localField: 'control_ids',
    //       foreignField: '_id.str()',
    //       as: "controls"
    //     }

    //   },

    // ]
    console.log(queryParams);
    Repository.getMany('rooms', queryParams).then((rooms) => {
      var done = () => {
        res.json(rooms);
      }
      if (rooms && rooms.length > 0) {
        Repository.getMany<HomieNode>('nodes', {}).then((nodes) => {
          if (nodes && nodes.length > 0) {
            rooms.map((room: Room) => {
              if (room.control_ids) {
                room.controls = nodes.filter((node) => {
                  return room.control_ids.indexOf(node._id.toString()) !== -1;
                })
              }
            });
            done();
          } else {
            done();
          }
        });
      } else {
        done();
      }
    })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  }
  private getOneRoom(req: Request, res: Response) {
    var id = req.params.room_id;
    try {
      var filter = { _id: new ObjectID(id) };
      Repository.getOne('rooms', filter).then((room) => {
        res.json(room);
      })
        .catch((err) => {
          console.log(err);
          res.sendStatus(INTERNAL_SERVER_ERROR);
        })
    } catch (e) {
      res.sendStatus(BAD_REQUEST);
    }
  }
  private createRoom(req: Request, res: Response) {
    var room: Room = req.body;
    Repository.insertOne('rooms', room).then((room) => {
      res.json(room);
    })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      })
  }
  private updateRoom(req: Request, res: Response) {
    try {
      var room: Room = req.body;
      var id = req.params.room_id;
      var filter = { _id: new ObjectID(id) };
      Repository.updateOne('rooms', filter, room).then((room) => {
        res.json(room);
      })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        })
    } catch (e) {
      res.sendStatus(BAD_REQUEST);
    }

  }
  private partiallyUpdateRoom(req: Request, res: Response) {
    var device: Room = req.body;
    return this.updateRoom(req, res);
  }
  private deleteRoom(req: Request, res: Response) {
    try {
      var id = req.params.room_id;
      var filter = { _id: new ObjectID(id) };
      Repository.deleteOne('rooms', filter).then((result) => {
        res.json(result);
      })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        })
    } catch (e) {
      res.sendStatus(BAD_REQUEST);
    }
  }
}

