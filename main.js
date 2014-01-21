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

expressServer.use(express.cookieParser());
expressServer.use(express.session({
	secret : 'onion.io'
}));

/***** WebSocket server *****/

socketServer.sockets.on('connection', function(socket) {
	socket.emit('news', {
		hello : 'world'
	});
	socket.emit('test', {
		data : 'socket io works'
	});	
	socket.on('login', function(data) {
		var emialAccount = "harry@onion.io";
		var password = "success";
		if (data && data.email == emialAccount && data.password == password) {
			socket.emit('isLogin', {
				status : true
			});
		} else {
			socket.emit('isLogin', {
				status : false
			});
		}
	});
});

/***** HTTP server *****/

// Configure the express server
expressServer.configure(function() {
	expressServer.use(express.basicAuth('dev', 'philosophy'));
	expressServer.use('/', express.static(__dirname + '/client'));

	expressServer.get('*', function(req, res) {
		res.redirect('/');
	});
});

httpServer.listen(8081);
