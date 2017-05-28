import { NextFunction, Request, Response, Router } from 'express';
import { Repository } from '../../repository/repository';
import { ObjectID } from 'mongodb';
import { HomieNode } from '../../models/smart-devices';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { RepoQueryParams } from '../../repository/repo-query-params';
export class NodesApiRoute {

  private basePath: string = '/nodes';
  constructor(private router: Router) {
    this.getRoutes();
    this.postRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }
  private postRoutes() {
    this.router.post(`${this.basePath}`, (req, res) => {
      this.createNode(req, res);
    });
  }
  private putRoutes() {
    this.router.put(`${this.basePath}/:node_id`, (req, res) => {
      this.updateNode(req, res);
    });
  }
  private patchRoutes() {
    this.router.patch(`${this.basePath}/:node_id`, (req, res) => {
      this.partiallyUpdateNode(req, res);
    });
  }
  private deleteRoutes() {
    this.router.delete(`${this.basePath}/:node_id`, (req, res) => {
      this.deleteNode(req, res);
    });
  }
  private getRoutes() {
    this.router.get(`${this.basePath}`, (req, res) => {
      this.getManyNodes(req, res);
    });
    this.router.get(`${this.basePath}/:node_id`, (req, res) => {
      this.getOneNode(req, res);
    });
  }

  private getManyNodes(req: Request, res: Response) {
    req.query = req.query || {};
    var fields: string = req.query['fields'] || '';
    var queryParams: RepoQueryParams = req.query;
    queryParams.skip = +queryParams.skip || 0;
    queryParams.limit = +queryParams.limit || 1000;
    queryParams.fields = {};
    fields.split(',').concat(fields.split('|')).filter(s=>{
      return (s && s.trim().length>0)
    })
    .forEach(f => {
      queryParams.fields[f] = 1;
    });
    console.log(queryParams);
    Repository.getMany('nodes', queryParams).then((nodes) => {
      res.json(nodes);
    })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  }
  private getOneNode(req: Request, res: Response) {
    var id = req.params.node_id;
    try {
      var filter = { _id: new ObjectID(id) };
      Repository.getOne('nodes', filter).then((node) => {
        res.json(node);
      })
        .catch((err) => {
          console.log(err);
          res.sendStatus(INTERNAL_SERVER_ERROR);
        })
    } catch (e) {
      res.sendStatus(BAD_REQUEST);
    }
  }
  private createNode(req: Request, res: Response) {
    var node: HomieNode = req.body;
    Repository.insertOne('nodes', node).then((node) => {
      res.json(node);
    })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      })
  }
  private updateNode(req: Request, res: Response) {
    try {
      var node: HomieNode = req.body;
    var id = req.params.node_id;
      var filter = { _id: new ObjectID(id) };
      Repository.updateOne('nodes', filter, node).then((node) => {
        res.json(node);
      })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        })
    } catch (e) {
          res.sendStatus(BAD_REQUEST);
     }

  }
  private partiallyUpdateNode(req: Request, res: Response) {
    return this.updateNode(req, res);
  }
  private deleteNode(req: Request, res: Response) {
    try {
    var id = req.params.node_id;
      var filter = { _id: new ObjectID(id) };
      Repository.deleteOne('nodes', filter).then((result) => {
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

