#!/usr/bin/env node
"use strict";
var tsclogger = require('tscconsole');
//module dependencies
var server = require("../build/server");
var debug = require("debug")("express:server");
var http = require("http"); 

//create http server


var envArg = process.argv.find(function(arg) {
  return arg.match(/(--env|-env)(=)[A-z]+/g);
})||'';
var env='development', envArray=envArg.split('=');
if(envArray.length>1){
  env=envArray[1]||"development";
}
  
process.env.NODE_ENV = env;

var portArg = process.argv.find(function(arg) { 
  return arg.match(/(--port|-p)(=)\d+/g);
})||'';
var port=portArg.match(/\d+/g)||[3000];
var httpPort = normalizePort(port[0]);

var boot = server.Server.bootstrap();
var app = boot.app;




tsclogger.init(app);
var mqttServer = boot.mqttServer;
app.set("port", httpPort);
var httpServer = http.createServer(app);
mqttServer.attachHttpServer(httpServer);
//listen on provided ports 
httpServer.listen(httpPort);

//add error handler
httpServer.on("error", onError);

//start listening on port
httpServer.on("listening", onListening);
 

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = httpServer.address();
  var bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  debug("Listening on " + bind);
}