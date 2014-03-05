'use strict';

// SockJS with Express 3
var express = require('express');
var socket = require('socket.io');
var http = require('http');
var rpc = require('./server/amqp-rpc/amqp_rpc');
var nodemailer = require("nodemailer");
var uuid = require('node-uuid');
var request = require('request');
var idgen = require('idgen');
var crypto = require('crypto');

// Create servers
var expressServer = express();
var httpServer = http.createServer(expressServer);
var socketServer = socket.listen(httpServer, {
	log : false
});

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

/***** WebSocket server *****/

var connections = {};

socketServer.sockets.on('connection', function (socket) {
	var userInfo = {};
	//connections = socket;
	socket.emit('CONNECTED', {});

	userInfo.socketId = socket.id;

	socket.emit('test', {
		data : 'socket io works'
	});

	socket.on('LOGIN', function (data) {
		rpc.call('DB_GET_USER', {
			email : data.email,
			passHash : data.hash
		}, function (result) {
			if (result != null) {
				var _token = uuid.v1().replace(/-/g, "");
				//var _result = JSON.parse(result);
				userInfo.userId = result._id;
				userInfo.email = result.email;
				connections[userInfo.userId] = socket;

				rpc.call('DB_ADD_SESSION', {
					token : _token,
					userId : result._id
				}, function (data) {
					socket.emit('LOGIN_PASS', {
						token : _token
					});
				});
			} else {
				socket.emit('LOGIN_FAIL');
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
					if (session && session.userId) {
						userInfo.userId = session.userId;
						connections[userInfo.userId] = socket;
						rpc.call('DB_GET_USER', {
							_id : userInfo.userId
						}, function(user) {
							if (user) {
								userInfo.email = user.email;

							}
						});
					}
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
		rpc.call('DB_GET_DEVICE', data, function(devicLists) {
			socket.emit('LIST_DEVICES_PASS', devicLists);
		});
	});

	socket.on('GET_DEVICE', function(data) {
		if (userInfo && userInfo.userId)
			data.userId = userInfo.userId;
		rpc.call('DB_GET_DEVICE', data, function(devicList) {
			socket.emit('GET_DEVICE_PASS', devicList)
		});
	});

	socket.on('ADD_DEVICE', function(data) {
		var _key = idgen(16);
		var id = idgen();
		data.key = _key;
		data.id = id;
		if (userInfo && userInfo.userId)
			data.userId = userInfo.userId;

		rpc.call('DB_ADD_DEVICE', data, function(data) {
			socket.emit('ADD_DEVICE_PASS', {
				id : data.id
			});
			rpc.call('DB_ADD_HISTORY', {
				deviceId : data.id,
				action : 'Device created'
			}, function(data) {

			});
		});
	});

	socket.on('DEVICE_UPDATE', function(data) {
		data.update = {
			$set : {
				'meta.name' : data.update.name,
				'meta.description' : data.update.description,
				'meta.deviceType' : data.update.deviceType
			}
		};

		rpc.call('DB_UPDATE_DEVICE', data, function(device) {
			rpc.call('DB_GET_DEVICE', data.condition, function(devicList) {
				socket.emit('DEVICE_UPDATE_PASS', devicList);
			});
		});
	});

	socket.on('DELETE_DEVICES', function(data) {

		for (var i = 0; i < data.length; i++) {
			rpc.call('DB_DELETE_DEVICE', data[i], function(data) {
				socket.emit('DELETE_DEVICES_PASS', {});
			});
		}

	});

	socket.on('ADD_PROCEDURE', function(data) {
		if (data && data._id || data.id) {
			rpc.call('DB_ADD_PROCEDURE', {
				path : '/gon',
				functionId : 1,
				verb : 'GET',
				deviceId : data.id,
				postParams : ['temp', 'altitude'],
				lastAccess : new Date()
			}, function(data) {
			});
		}
	});

	socket.on('GET_PROCEDURE', function(data) {
		rpc.call('DB_GET_PROCEDURE', {}, function(data) {
			socket.emit('GET_PROCEDURE_PASS', data);
		});
	});

	socket.on('GET_STATE', function(data) {
		rpc.call('DB_GET_STATE', {}, function(data) {
			socket.emit('GET_STATE_PASS', data);
		});
	});

	socket.on('ADD_STATES', function(data) {
		if (data && data._id || data.id) {

			rpc.call('DB_ADD_STATE', {
				path : '/statePath',
				value : 333,
				deviceId : data.id,
				timeStamp : new Date()
			}, function(data) {
			});
		}
	});

	socket.on('RENEW_KEY', function(data) {
		var Data = {};
		Data.condition = data;
		var _key = idgen(16);
		Data.update = {
			key : _key
		};
		rpc.call('DB_UPDATE_DEVICE', Data, function(device) {
			socket.emit('RENEW_KEY_PASS', {
				key : _key
			});
		});
	});

	socket.on('USER_UPDATE', function(data) {
		data.condition = {
			_id : userInfo.userId
		};

		rpc.call('DB_GET_USER', {
			_id : userInfo.userId,
			passHash : data.oldPass
		}, function(_user) {
			if (!data.isReset || _user) {
				rpc.call('DB_UPDATE_USER', data, function(user) {
					socket.emit('USER_UPDATE_PASS', {});
				});

			} else if (data.isReset && !data.update.passHash) {
				socket.emit('USER_UPDATE_FAIL', {});
			} else {
				socket.emit('USER_UPDATE_FAIL', {});
			}
		});

	});

	socket.on('GET_USER', function(data) {
		rpc.call('DB_GET_USER', {
			_id : userInfo.userId
		}, function(user) {
			socket.emit('GET_USER_PASS', user);
		});
	});

	socket.on('GET_HISTORY', function(data) {
		console.log('GET_HISTORY');
		rpc.call('DB_GET_HISTORY', {
			deviceId : data.deviceId
		}, function(his) {
			
			socket.emit('GET_HISTORY_PASS', his);
		});
	});

	socket.on('ADD_HISTORY', function(data) {

		rpc.call('DB_ADD_HISTORY', data, function(result) {

			socket.emit('ADD_HISTORY_PASS', result);
		});
	});

	socket.on('FORUMS_SETUP', function () {
		rpc.call('DB_GET_USER', {
			_id : userInfo.userId
		}, function(user) {
			var timestamp = Math.round(+new Date / 1000);

			var gravatarHash = crypto.createHash('md5');
			gravatarHash.update(user.email);
			var gravatarUrl = '//gravatar.com/avatar/' + gravatarHash.digest('hex') + '?d=identicon';

			var message = (new Buffer(JSON.stringify({
			   user: {
			      id: user.email,
			      displayname: user.fullname || user.email,
			      email: user.email,
			      avatar: gravatarUrl,
			      is_admin: !!user.admin
			   }
			}))).toString('base64');

			var signatureHash = crypto.createHash('sha1');
			signatureHash.update('vV8MtWdvEJ2lpBanvYhUpNwJ' + ' ' + message + ' ' + timestamp);
			var signature = signatureHash.digest('hex');

			socket.emit('FORUMS_SETUP_PASS', {
				timestamp: timestamp,
				message: message,
				signature: signature
			});
		});
	});

	socket.on('realtime', function(e) {

		rpc.call('REALTIME_UPDATE_HISTORY', {
			deviceId : 'AbYrsuO2'
		}, function(data) {

		});
	});

});

rpc.register('REALTIME_UPDATE_HISTORY', function(p, callback) {
	var email;
	var userId;
	rpc.call('DB_GET_DEVICE', {
		id : p.deviceId
	}, function(device) {
		userId = device.userId;

		rpc.call('DB_GET_HISTORY', {
			deviceId : p.deviceId
		}, function(his) {
			console.log('history pass');
			connections[userId].emit('GET_HISTORY_PASS', his);
		});
	});
	callback({});
});

rpc.register('REALTIME_UPDATE_PROCEDURE', function(p, callback) {
	var email;
	var userId;
	rpc.call('DB_GET_DEVICE', {
		id : p.deviceId
	}, function(device) {
		userId = device.userId;
		connections[userId].emit('GET_DEVICE_PASS', device);
	});
	callback({});
});

rpc.register('REALTIME_UPDATE_STATE', function(p, callback) {
	var email;
	var userId;
	rpc.call('DB_GET_DEVICE', {
		id : p.deviceId
	}, function(device) {
		userId = device.userId;
		connections[userId].emit('GET_DEVICE_PASS', device);
	});
	callback({});
});

/***** HTTP server *****/

// Configure the express server
expressServer.configure(function() {
	//expressServer.use(express.basicAuth('dev', 'philosophy'));
	expressServer.use('/', express.static(__dirname + '/client'));
	expressServer.get('/forums/:message/:timestamp/:signature', function (req, res) {
		res.end('<!doctype html><html><head><link rel="stylesheet" type="text/css" href="//cdn.moot.it/1/moot.css" /><link rel="stylesheet" type="text/css" href="/css/forums.css" /><meta name="viewport" content="width=device-width" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//cdn.moot.it/1/moot.min.js"></script></head><body><a id="moot" href="https://moot.it/i/onion">Onion Forums</a><script>$("#moot").moot({api: {key: "aaFn5b4rnM", signature: "' + req.params.signature + '", message: "' + req.params.message + '", timestamp: "' + req.params.timestamp + '"}});</script></body></html>');
	});
	expressServer.get('*', function (req, res) {
		res.redirect('/');
	});
});

httpServer.listen(80);
