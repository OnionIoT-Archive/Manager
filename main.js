'use strict';

// SockJS with Express 3
var express = require('express');
var socket = require('socket.io');
var http = require('http');
var manager = require('./server/main');
var rpc = require('./server/amqp-rpc/amqp_rpc');
var nodemailer = require("nodemailer");
var uuid = require('node-uuid');
var request = require('request');
var idgen = require('idgen');
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

var userInfo = {};

/***** WebSocket server *****/

var connections = {};

socketServer.sockets.on('connection', function(socket) {
	connections = socket;
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
				userInfo.userId = result._id;
				userInfo.email = result.email;
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
		console.log(data);
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

			// foreach (device in deviceLists)
			// connections[device.id] = socket;
			//TODO:
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
				id : data._id
			});
		});
	});

	socket.on('DEVICE_UPDATE', function(data) {
		data.update = {
			$set : {
				'meta.name' : data.update.name,
				'meta.description' : data.update.description
			}
		};

		rpc.call('DB_UPDATE_DEVICE', data, function(device) {
			rpc.call('DB_GET_DEVICE', data.condition, function(devicList) {
				socket.emit('DEVICE_UPDATE_PASS', devicList);
			});
		});
	});

	// socket.on('DELETE_DEVICE', function(data) {
	// rpc.call('DB_DELETE_DEVICE', data, function(data) {
	// socket.emit('DELETE_DEVICE_PASS', {});
	// });
	// });

	socket.on('DELETE_DEVICES', function(data) {
		console.log(data);
		for (var i = 0; i < data.length; i++) {
			rpc.call('DB_DELETE_DEVICE', data[i], function(data) {
				socket.emit('DELETE_DEVICES_PASS', {});
			});
		}
	});

	socket.on('ADD_PROCEDURE', function(data) {

		if (data && data._id) {
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

	socket.on('GET_PROCEDURE', function(data) {
		console.log('call procedure');
		rpc.call('DB_GET_PROCEDURE', {}, function(data) {
			console.log('rpc procedure');
			socket.emit('GET_PROCEDURE_PASS', data);
		});
	});

	socket.on('GET_STATE', function(data) {
		console.log('call GET_STATE');
		rpc.call('DB_GET_STATE', {}, function(data) {
			console.log('rpc GET_STATE');
			socket.emit('GET_STATE_PASS', data);
		});
	});

	socket.on('ADD_STATES', function(data) {
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
		rpc.call('DB_GET_HISTORY', {
			deviceId : data.deviceId
		}, function(his) {
			socket.emit('GET_HISTORY_PASS', his);
		});
	});

	socket.on('ADD_HISTORY', function(data) {
		console.log(data);
		rpc.call('DB_ADD_HISTORY', data, function(result) {
			console.log('result');
			socket.emit('ADD_HISTORY_PASS', result);
		});
	});

	socket.on('UPLOAD_SUPPORT', function(data) {
		request.post('https://docs.google.com/a/onion.io/forms/d/14oz4l53ZnGv5EFnddhWDisp1kz0G_RXmYY8ahCXlfDw/formResponse', {
			form : {
				entry_1679870466 : userInfo.email,
				entry_1266873877 : data.subject,
				entry_1148148744 : data.details
			}
		}, function(err, response) {
			if (err) {

			} else {
				socket.emit('UPLOAD_SUPPORT_PASS', {});
			}
		});
	});

	// rpc.call('TEST_MANAGER', {}, function(data) {
	//
	// });

});

// rpc.register('TEST_MANAGER', function(p, callback) {
// var data = {
// userId : userInfo.userId
// };
// console.log(userInfo);
// rpc.call('DB_GET_DEVICE', data, function(devicLists) {
// connections.emit('LIST_DEVICES_PASS', devicLists);
// });
// });

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
