var rewire = require('rewire');
var expect = require('expect.js');
var assert = require('chai').assert;
var sinon = require('sinon');
declare var before;
declare var after;

import { MqttServer } from '../../src/mqtt-server/mqtt-server';
import { ConfigManager } from "../../src/configs/config-manager";

var config = { mongodb: { connectionUrl: '' } };
var ConfigManagerMock, emitSpy, moscaServerStub, server: any
, testMqttClient={ id: 'test_id' }
, topic='test/topic';
describe('MQTTServer', () => {
    var sandbox;
    before(() => {
        sandbox = sinon.sandbox;
        moscaServerStub = sandbox.stub(MqttServer.prototype, 'moscaServer');
        ConfigManagerMock = sandbox.mock(ConfigManager);
    })
    beforeEach(() => {
        server = new MqttServer;
        emitSpy = sandbox.spy(server, 'emit');

    })
    after(() => {
        sandbox.restore();
    });
    afterEach(() => {
        emitSpy.restore();
    });
    describe('constructor', () => {
        it('should be truthy', () => {
            expect(server).to.be.ok();
        })
        it('should be initialized', () => {
            let spy = sandbox.spy(MqttServer.prototype, 'init');
            let server = new MqttServer;
            assert.isTrue(spy.calledOnce)
        })
    })
    describe('init', () => {
        it('should retrieve configuration data', () => {
            expect(server.config).to.be.ok();
            ConfigManagerMock.expects('getConfig').returns(config);
            server.init();
            ConfigManagerMock.verify();
            ConfigManagerMock.restore();
        });
        it('should create server instance ', () => {
            expect(server.config).to.be.ok();
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