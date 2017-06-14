var expect = require('expect.js');
var assert = require('chai').assert;
var sinon = require('sinon');

import { OtaRestApi } from '../../../src/ota-server/api-rest/ota-rest-app';
import { FirmwareApiRoutes } from "../../../src/ota-server/api-rest/ota-rest-firmware";

describe("OtaRestApi", () => {
    describe('When initialised', () => {
        let apiRoutesInstance = new OtaRestApi();
        it('Should call setup', () => {
            let spy = sinon.spy(apiRoutesInstance, 'setup');
            apiRoutesInstance.init();
            assert.isTrue(spy.calledOnce);
        });
        describe('Setup', () => {
            let apiRoutesInstance = new OtaRestApi();
            it('Should create a new express instance', () => {
                expect(apiRoutesInstance).to.have.property('app');
                expect(apiRoutesInstance.app).to.be.ok();
            });


            it('Should get firmwareApi instance', ()=>{
                let spy = sinon.spy(FirmwareApiRoutes,'getApp');
                apiRoutesInstance.setup();
                expect(apiRoutesInstance).to.have.property('firmwareApi');
                expect(apiRoutesInstance.firmwareApi).to.be.ok();
                assert.isTrue(spy.calledOnce);
            });
          
            it('Should call app.use with base_path', ()=>{
                let apiRoutesInstance = new OtaRestApi();
                let spy = sinon.spy(apiRoutesInstance.app,'use');
                apiRoutesInstance.setup();
                assert.isTrue(spy.withArgs(apiRoutesInstance.base_path,apiRoutesInstance.firmwareApi).calledOnce);
            });
        })

    });
})