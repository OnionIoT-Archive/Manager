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
}

function testEmail() {
	smtpTransport.sendMail(mailOptions, function(error, response) {
		if (error) {
			console.log(error);
		} else {
			console.log("Message sent: " + response.message);
		}
	});
};

testEmail();

rpc.call('DB_CHECK_TEST', {
}, function(result) {
	console.log('DB_CHECK_TEST');
	console.log(result);
});

rpc.call('DB_ADD_USER', {
	id : 'String',
	email : 'harry@onion.io',
	passHash : 'String',
	status : 'String',
	devices : ['Array'],
	date : new Date()
}, function(result) {
	console.log('DB_ADD_USER');
	console.log(result);
});

rpc.call('DB_ADD_DEVICE', {
	name : 'harry friday',
}, function(result) {
	console.log('DB_ADD_DEVICE');
	console.log(result);
});

rpc.call('DB_GET_USER', {
	email : 'harry@onion.io2'
}, function(result) {
	console.log('DB_GET_USER');
	console.log(result);
});

rpc.call('DB_GET_DEVICE', {
	name : 'harry friday'
}, function(result) {
	console.log('DB_GET_DEVICE harry');
	console.log(result);
});

rpc.call('DB_DELETE_DEVICE', {
	_id : '52e03edfb2547c00005b8a27'
}, function(result) {
	console.log('DB_DELETE_DEVICE harry');
	console.log(result);
});

rpc.call('DB_UPDATE_DEVICE', {
	condition : {
		_id : "52e03f8001797800006574c3"
	},
	update : {
		name : "update harry friday"
	}
}, function(result) {
	console.log('DB_UPDATE_DEVICE harry');
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
<<<<<<< HEAD
		console.log('login harry');
=======
		console.log('received login');
>>>>>>> eabcd55a04bd8166757c15d8061f5c78d949ee80
		rpc.call('DB_GET_USER', {
			email : data.email,
			passHash : data.hash
		}, function(result) {
			if (result) {
				var _token = uuid.v1();
				rpc.call('DB_ADD_SESSION', {
					token : _token
				}, function(data) {
					socket.emit('LOGIN_SUCCESS', {
						token : data.token
					});
				});
			} else {
				socket.emit('LOGIN_FAILED', {
				});
			}
		});
	});

	socket.on('SIGNUP', function(data) {

		rpc.call('DB_GET_USER', {
			email : data.email
		}, function(result) {
			if (result) {
				socket.emit('SIGNUP_FAIL', {
				});
			} else {
				rpc.call('DB_ADD_USER', {
					email : data.email,
					passHash : data.hash
				}, function(result) {
					socket.emit('SIGNUP_SUCCESS', {

					});
				});
			}
		});
	});

<<<<<<< HEAD
	socket.on('FORGOT_PASSWORD', function(data) {
=======
	socket.on('FORGOT', function(data) {
>>>>>>> eabcd55a04bd8166757c15d8061f5c78d949ee80
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
