import { NextFunction, Request, Response, Router } from 'express';
import { Repository } from '../../repository/repository';
import { ObjectID } from 'mongodb';
import { Automation } from '../../models/automation/automation';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { RepoQueryParams } from '../../repository/repo-query-params';
import { HomieNode } from '../../models/smart-devices';
import { NodePropertyMapper } from '../../mappers/node-property-mapper';
export class AutomationsApiRoute {

// TODO:: Validate automation payload and strip out unessesary properties

  private basePath: string = '/automations';
  constructor(private router: Router) {
    this.getRoutes();
    this.postRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }
  private postRoutes() {
    this.router.post(`${this.basePath}`, (req, res) => {
      this.createAutomation(req, res);
    });
  }
  private putRoutes() {
    this.router.put(`${this.basePath}/:automation_id`, (req, res) => {
      this.updateAutomation(req, res);
    });
  }
  private patchRoutes() {
    this.router.patch(`${this.basePath}/:automation_id`, (req, res) => {
      this.partiallyUpdateAutomation(req, res);
    });
  }
  private deleteRoutes() {
    this.router.delete(`${this.basePath}/:automation_id`, (req, res) => {
      this.deleteAutomation(req, res);
    });
  }
  private getRoutes() {
    this.router.get(`${this.basePath}`, (req, res) => {
      this.getManyAutomations(req, res);
    });
    this.router.get(`${this.basePath}/:automation_id`, (req, res) => {
      this.getOneAutomation(req, res);
    });
  }

  private getManyAutomations(req: Request, res: Response) {
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
    Repository.getMany('automations', queryParams).then((automations) => {
      var done = () => {
        res.json(automations);
      }
      if (automations && automations.length > 0) {
        Repository.getMany<HomieNode>('nodes', {}).then((nodes) => {
          if (nodes && nodes.length > 0) {
            NodePropertyMapper.fixNodeProperties(nodes);
            automations.forEach((automation: Automation) => {
              if (automation.effects) {
                automation.effects.map((effect) => {
                  effect.node = nodes.find(node => {
                    return node.node_id === effect.node_id && node.device_id === effect.device_id;
                  });
                })
              }
            });
            done();
          } else {
            done();
          }
        });
        done();
      } else {
        done();
      }
    })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  }

  private getOneAutomation(req: Request, res: Response) {
    var id = req.params.automation_id;
    try {
      var filter = { _id: new ObjectID(id) };
      Repository.getOne('automations', filter).then((automation) => {
        res.json(automation);
      })
        .catch((err) => {
          console.log(err);
          res.sendStatus(INTERNAL_SERVER_ERROR);
        })
    } catch (e) {
      res.sendStatus(BAD_REQUEST);
    }
  }
  private createAutomation(req: Request, res: Response) {
    var automation: Automation = req.body;
    Repository.insertOne('automations', automation).then((automation) => {
      res.json(automation);
    })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      })
  }
  private updateAutomation(req: Request, res: Response) {
    try {
      var automation: Automation = req.body;
      var id = req.params.automation_id;
      var filter = { _id: new ObjectID(id) };
      Repository.updateOne('automations', filter, automation).then((automation) => {
        res.json(automation);
      })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        })
    } catch (e) {
      res.sendStatus(BAD_REQUEST);
    }

  }
  private partiallyUpdateAutomation(req: Request, res: Response) {
    var automation: Automation = req.body;
    return this.updateAutomation(req, res);
  }
  private deleteAutomation(req: Request, res: Response) {
    try {
      var id = req.params.automation_id;
      var filter = { _id: new ObjectID(id) };
      Repository.deleteOne('automations', filter).then((result) => {
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

