'use strict';

// SockJS with Express 3
var express = require('express');
var socket = require('socket.io');
var http = require('http');
var manager = require('./server/main');
var rpc = require('./server/amqp-rpc/amqp_rpc');
var nodemailer = require("nodemailer");
var uuid = require('node-uuid');

// Create servers
var expressServer = express();
var httpServer = http.createServer(expressServer);
var socketServer = socket.listen(httpServer);

expressServer.use(express.cookieParser());
expressServer.use(express.session({
	secret : 'onion.io'
}));

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
	service : "Gmail",
	auth : {
		user : "harry@onion.io",
		pass : "Aa!123456"
	}
});

// setup e-mail data with unicode symbols
var mailOptions = {
	from : "Onion ✔ <harry@onion.io>", // sender address
	to : "harry@onion.io", // list of receivers
	subject : "Onion:Reset Passwrd", // Subject line
	text : "Http://www.onion.io/changethis", // plaintext body
	html : "<b>Click <a href='#'>here</a> to reset your password</b>" // html body
};

var userInfo = {};

/***** WebSocket server *****/

socketServer.sockets.on('connection', function(socket) {
	socket.emit('CONNECTED', {});

	userInfo.socketId = socket.id;

	socket.emit('news', {
		hello : 'world'
	});
	socket.emit('test', {
		data : 'socket io works'
	});

	socket.on('LOGIN', function(data) {
		rpc.call('DB_GET_USER', {
			email : data.email,
			passHash : data.hash
		}, function(result) {
			if (result != null) {
				var _token = uuid.v1().replace(/-/g, "");
				//var _result = JSON.parse(result);
				if (!userInfo.userId)
					userInfo.userId = result._id;
				rpc.call('DB_ADD_SESSION', {
					token : _token,
					userId : result._id
				}, function(data) {
					socket.emit('LOGIN_PASS', {
						token : _token
					});
				});
			} else {
				socket.emit('LOGIN_FAIL', {
				});
			}
		});
	});

	socket.on('LOGOUT', function(data) {
		rpc.call('DB_REMOVE_SESSION', data, function(data) {
			socket.emit('LOGOUT_PASS', {});
		});
	});

	socket.on('SIGNUP', function(data) {
		rpc.call('DB_GET_USER', {
			email : data.email
		}, function(result) {
			if (result == null) {
				rpc.call('DB_ADD_USER', {
					email : data.email,
					passHash : data.hash
				}, function(result) {
					socket.emit('SIGNUP_PASS', {
					});
				});
			} else {
				socket.emit('SIGNUP_FAIL', {
				});
			}
		});
	});

	socket.on('CHECK_SESSION', function(data) {

		if (data && data.token) {
			rpc.call('DB_GET_SESSION', {
				token : data.token
			}, function(session) {

				if (session == null) {
					socket.emit('CHECK_SESSION_FAIL', {
					});
				} else {
					userInfo.token = data.token;
					if (session && session.userId)
						userInfo.userId = session.userId;
					socket.emit('CHECK_SESSION_PASS', {
					});
				}
			})
		} else {

		}
	});

	socket.on('FORGOT_PASSWORD', function(data) {
		// setup e-mail data with unicode symbols
		var mailOptions = {
			from : "Onion ✔ <harry@onion.io>", // sender address
			to : data.email, // list of receivers
			subject : "Onion:Reset Passwrd", // Subject line
			text : "Http://www.onion.io/changethis", // plaintext body
			html : "<b>Click <a href='#'>here</a> to reset your password</b>" // html body
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				console.log(error);
			} else {
				console.log("Message sent: " + response.message);
			}
		});
	});

	socket.on('LIST_DEVICES', function(data) {
		if (userInfo && userInfo.userId)
			data.userId = userInfo.userId;
		console.log(data);
		rpc.call('DB_GET_DEVICE', data, function(devicLists) {
			socket.emit('LIST_DEVICES_PASS', devicLists)
		});
	});

	socket.on('GET_DEVICE', function(data) {
		console.log(data);
		if (userInfo && userInfo.userId)
			data.userId = userInfo.userId;
		rpc.call('DB_GET_DEVICE', data, function(devicList) {
			console.log(devicList);
			socket.emit('GET_DEVICE_PASS', devicList)
		});
	});

	socket.on('ADD_DEVICE', function(data) {
		console.log(data);
		var _key = uuid.v4().replace(/-/g, "");
		data.key = _key;
		if (userInfo && userInfo.userId)
			data.userId = userInfo.userId;
		rpc.call('DB_ADD_DEVICE', data, function(data) {
			console.log(data);
			socket.emit('ADD_DEVICE_PASS', {id:data._id});
		});
	});

	socket.on('DEVICE_UPDATE', function(data) {
		data.update =  {$set: {'meta.name': data.update.name,'meta.description':data.update.description}};
		
		rpc.call('DB_UPDATE_DEVICE', data, function(device) {
			console.log('device');
			console.log(device);
			rpc.call('DB_GET_DEVICE', data.condition, function(devicList) {
				console.log(devicList);
				socket.emit('DEVICE_UPDATE_PASS', devicList);
			});

		});
	});

	socket.on('DELETE_DEVICE', function(data) {
		rpc.call('DB_DELETE_DEVICE', data, function(data) {
			socket.emit('DELETE_DEVICE_PASS', {});
		});
	});

	socket.on('ADD_PROCEDURE', function(data) {

		if (data && data._id) {
			console.log(data);
			rpc.call('DB_ADD_PROCEDURE', {
				path : '/test',
				fuctionId : 1002,
				verb : 'post',
				deviceId : data._id,
				postParams : ['temp', 'altitude'],
				lastAccess : new Date()
			}, function(data) {
			});
		}
	});

	socket.on('ADD_STATES', function(data) {
		console.log(data);
		if (data && data._id) {

			rpc.call('DB_ADD_STATE', {
				path : '/statePath',
				value : 333,
				deviceId : data._id,
				timeStamp : new Date()
			}, function(data) {
			});
		}
	});

	socket.on('RENEW_KEY', function(data) {
		var Data ={};
		Data.condition = data;
		var _key = uuid.v4().replace(/-/g, "");
		Data.update = {key:_key};
		rpc.call('DB_UPDATE_DEVICE', Data, function(device) {
			console.log(device);
			socket.emit('RENEW_KEY_PASS', {
			key : _key
		});
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
