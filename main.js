'use strict';

// SockJS with Express 3
var express = require('express');
var socket = require('socket.io');
var http = require('http');

var manager = require('./server/main');

// Create servers
var expressServer = express();
var httpServer = http.createServer(expressServer);
var socketServer = socket.listen(httpServer);


/***** WebSocket server *****/

socketServer.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});

/***** HTTP server *****/

// Configure the express server
expressServer.configure(function () {
	expressServer.use(express.basicAuth('dev', 'philosophy'));
    expressServer.use('/', express.static(__dirname + '/client'));
});

httpServer.listen(80);
