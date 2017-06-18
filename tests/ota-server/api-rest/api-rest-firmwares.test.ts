import * as express from 'express';
var expect = require('expect.js');
var assert = require('chai').assert;
var sinon = require('sinon');
import 'mocha';
import { OtaRestApi } from '../../../src/ota-server/api-rest/ota-rest-app';
import { FirmwareApiRoutes } from "../../../src/ota-server/api-rest/ota-rest-firmware";

describe("FirmwareApiRoutes", () => {
    
    describe('Constructor', () => {
        let appInstance = new FirmwareApiRoutes;
        it('should set base_path to /firmwares', () => {
            assert.equal(appInstance.basePath, '/firmwares');
        })
        it('should set set expressApp to new instance of express App', () => {
            expect(appInstance.expressApp).to.be.ok();
        })
    })
    describe('init', ()=>{
        it('should call setup', ()=>{
            let appInstance = new FirmwareApiRoutes;
            let spy = sinon.spy(appInstance, 'setup');
            appInstance.init();
            assert.isTrue(spy.calledOnce);
        })
    });
    describe('setup', ()=>{
        it('should call expressApp.get with basePath', ()=>{
            let appInstance = new FirmwareApiRoutes;
            let spy = sinon.spy(appInstance.expressApp, 'get');
            appInstance.setup();
            assert.isTrue(spy.withArgs(appInstance.basePath).calledOnce);
        })
       
        it('should call expressApp get with basePath and :id_param', ()=>{
            let appInstance = new FirmwareApiRoutes;
            let spy = sinon.spy(appInstance.expressApp, 'get');
            appInstance.setup();
            assert.isTrue(spy.withArgs(`${appInstance.basePath}/:firmware_id`).calledOnce);
        })
    })
}) 