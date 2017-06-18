import { FileServer } from '../../src/file-server/file-server';
var expect = require('expect.js');
var assert = require('chai').assert;
var sinon = require('sinon');
declare var before;
declare var after;

let sandbox = sinon.sandbox, server: any;
describe('FileServer', () => {
    before(() => {

    });
    beforeEach(() => {
        server = new FileServer();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('Constructor', () => {
        it('should call init()', () => {
            let spy = sandbox.spy(FileServer.prototype, 'init');
            let server = new FileServer();
            assert.isTrue(spy.calledOnce);
        })
        it('should set base url to /', () => {
            expect(server.baseUrl).to.equal('/');
        });
        it('should call setupRoutes', () => {
            let spy = sandbox.spy(FileServer.prototype, 'setupRoutes');
            let server = new FileServer();
            assert.isTrue(spy.calledOnce);
        });
        it('should call setupRoutes only after calling init', () => {
            let setupRoutesSpy = sandbox.spy(FileServer.prototype, 'setupRoutes');
            let initSpy = sandbox.spy(FileServer.prototype, 'init');
            let server = new FileServer();
            assert.isTrue(initSpy.calledBefore(setupRoutesSpy));
            assert.isTrue(setupRoutesSpy.calledAfter(initSpy));
        })
    })
    describe('init', () => {
        it('should call  a new express app', () => {
            expect(server.expressApp).to.be.ok();
        });
        it('should routePaths with respective route path values', () => {
            expect(server.routePaths).to.be.ok();
            assert.equal(server.routePaths.getAll, `${server.baseUrl}/files`);
            assert.equal(server.routePaths.getOne, `${server.baseUrl}/files/:file_id`);
            assert.equal(server.routePaths.create, `${server.baseUrl}/files`);
            assert.equal(server.routePaths.replace,`${server.baseUrl}/files/:file_id`);
            assert.equal(server.routePaths.update, `${server.baseUrl}/files/:file_id`);
            assert.equal(server.routePaths.delete, `${server.baseUrl}/files/:file_id`);
        });

    })
    describe('getApp', () => {
        it('should return non null expressApp', () => {
            expect(server.getApp()).to.be(server.expressApp);
        })
    });
    describe('setupRoutes', () => {
        it('should call expressApp.get with base_url and getAll-Path', () => {
            let spy = sandbox.spy(server.expressApp, 'get');
            server.setupRoutes();
            expect(spy.withArgs(server.routePaths.getAll, server.getAllFiles).calledOnce).to.be(true);
        })
        it('should call expressApp.get with base_url and getOne-Path', () => {
            let spy = sandbox.spy(server.expressApp, 'get');
            server.setupRoutes();
            expect(spy.withArgs(server.routePaths.getOne, server.getOneFile).calledOnce).to.be(true);
        });
        it('should call expressApp.post with base_url and create-Path', () => {
            let spy = sandbox.spy(server.expressApp, 'post');
            server.setupRoutes();
            expect(spy.withArgs(server.routePaths.create, server.createFile).calledOnce).to.be(true);
        });
        it('should call expressApp.put with base_url and replace-Path', () => {
            let spy = sandbox.spy(server.expressApp, 'put');
            server.setupRoutes();
            expect(spy.withArgs(server.routePaths.replace, server.replaceFile).calledOnce).to.be(true);
        });
        it('should call expressApp.patch with base_url and replace-Path', () => {
            let spy = sandbox.spy(server.expressApp, 'patch');
            server.setupRoutes();
            expect(spy.withArgs(server.routePaths.update, server.updateFile).calledOnce).to.be(true);
        });
        it('should call expressApp.delete with base_url and delete-Path', () => {
            let spy = sandbox.spy(server.expressApp, 'delete');
            server.setupRoutes();
            expect(spy.withArgs(server.routePaths.delete, server.deleteFile).calledOnce).to.be(true);
        });
    });
    describe('getAllFiles', ()=>{
        it('should call Repository.getManyFiles with limit and ',()=>{
            
        })
    });
})