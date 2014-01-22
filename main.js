'use strict';

// SockJS with Express 3
var express = require('express');
var socket = require('socket.io');
var http = require('http');
var manager = require('./server/main');
var rpc = require('./server/amqp-rpc/amqp_rpc');

// Create servers
var expressServer = express();
var httpServer = http.createServer(expressServer);
var socketServer = socket.listen(httpServer);

expressServer.use(express.cookieParser());
expressServer.use(express.session({
	secret : 'onion.io'
}));

rpc.call('DB_ADD_USER', {
	user : 'guest',
	pass : 'guest'
}, function(result) {
	console.log('DB_ADD_USER');
	console.log(result);
});

rpc.call('DB_CHECK_SESSION', {
	user : 'guest',
	pass : 'guest'
}, function(result) {
	console.log('DB_CHECK_SESSION');
	console.log(result);
});

rpc.call('DB_CREATE_SESSION', {
	user : 'guest',
	pass : 'guest'
}, function(result) {
	console.log('DB_CREATE_SESSION');
	console.log(result);
});


/***** WebSocket server *****/

socketServer.sockets.on('connection', function(socket) {
	socket.emit('news', {
		hello : 'world'
	});
	socket.emit('test', {
		data : 'socket io works'
	});
	socket.on('LOGIN', function(data) {
		var emialAccount = "harry@onion.io";
		var password = "success";

		rpc.call('DB_CHECK_USER', {
			user : 'guest',
			pass : 'guest'
		}, function(result) {
			if (result) {
				socket.emit('LOGIN_SUCCESS', {
				});
			} else {
				socket.emit('LOGIN_FAILED', {
				});
			}
		});
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
