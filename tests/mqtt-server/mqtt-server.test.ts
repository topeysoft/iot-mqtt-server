

import * as mosca from 'mosca';
import { MqttServer } from '../../src/mqtt-server/mqtt-server';
import { ConfigManager } from "../../src/configs/config-manager";

var config = { mongodb: { connectionUrl: '' } };
var ConfigManagerMock, emitSpy, moscaServerStub, moscaServerMock, server: any
    , testMqttClient = { id: 'test_id' }
    , topic = 'test/topic';
describe('MQTTServer', () => {
    var sandbox;
    before(() => {
        sandbox = sinon.sandbox;
        server = new MqttServer;
        emitSpy = sandbox.spy(server, 'emit');
        ConfigManagerMock = sandbox.mock(ConfigManager);
        moscaServerMock = sandbox.stub(mosca.Server.prototype);
       // moscaServerStub = sandbox.stub(MqttServer.prototype, 'moscaServer');
    })
    beforeEach(() => { })
    after(() => {
        sandbox.restore();
    });
    afterEach(() => {
        emitSpy.restore();
     //   moscaServerStub.restore();
        ConfigManagerMock.restore();

    });
    describe('constructor', () => {
        it('should be truthy', () => {
            expect(server).to.be.ok();
        })
        it('should be initialized', () => {
            let spy = sandbox.spy(MqttServer.prototype, 'init');
            let server = new MqttServer;
            assert.isTrue(spy.calledOnce);
        })
    })
    describe('init', () => {
        it('should retrieve configuration data', () => {
            ConfigManagerMock.expects('getConfig').returns(config);
            server.init();
            // assert.isTrue((<any>(ConfigManager.getConfig)).callOnce);
            expect(server.config).to.be.ok();
        });
        it('should create server instance ', () => {
            expect(server.moscaServer).to.be.ok();
        });
        it('should call setupSercurity', () => {
            let spy = sandbox.spy(server, 'setupSecurity');
            server.init(); 
            assert.isTrue(spy.calledOnce)
        });


    })
    describe('Server Events', () => {
        var logSpy;

        beforeEach(() => {
            logSpy = sandbox.spy(console, 'log');
        })
        afterEach(() => {
            logSpy.restore();
        })
        it('should call setup and emit ready event when server is ready', () => {
            let setupSpy = sandbox.spy(server, 'setup');
            server.moscaServer.emit('ready', { id: 'test_id' });
            assert.isTrue(setupSpy.calledOnce);
        });
        it('should  emit client:connected event and log message when a client connects', () => {
            server.moscaServer.emit('clientConnected', testMqttClient);
            assert.isTrue(logSpy.withArgs('client connected', testMqttClient.id).calledOnce);
            assert.isTrue(emitSpy.withArgs('client:connected', testMqttClient.id).calledOnce);
        });
        it('should emit received event with client and packet when a client publishes a message', () => {
            server.moscaServer.emit('published', { test: 'packet' }, { id: 'test_id' });
            assert.isTrue(emitSpy.withArgs('received', { test: 'packet' }, { id: 'test_id' }).calledOnce);
        });
        it('should emit client:subscribed event and log message with topic when a client subscribes to a topic', () => {
            server.moscaServer.emit('subscribed', topic, testMqttClient);
            assert.isTrue(logSpy.withArgs('subscribed: ', topic).calledOnce);
            assert.isTrue(emitSpy.withArgs('client:subscribed', topic).calledOnce);
        });
        it('should log subscribed with topic when a client unsubscribes from a topic', () => {
            let topic = "test/topic";
            server.moscaServer.emit('unsubscribed', topic, { id: 'test_client_id' });
            assert.isTrue(logSpy.withArgs('unsubscribed: ', topic).calledOnce);
        });
        it('should emit event and log clientDisconnecting when a client is disconnecting', () => {
            let topic = "test/topic";
            let client = { id: 'test_client_id' };
            server.moscaServer.emit('clientDisconnecting', client);
            assert.isTrue(logSpy.withArgs('clientDisconnecting: ', client.id).calledOnce);
        });
    })
})