'use strict';

// SockJS with Express 3
var express = require('express');
var socket = require('socket.io');
var http = require('http');
var manager = require('./server/main');
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

manager.setupSocket(socketServer);

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

/***** HTTP server *****/

// Configure the express server
expressServer.configure(function() {
	//expressServer.use(express.basicAuth('dev', 'philosophy'));
	/*expressServer.get('/forums', function (req, res) {
		res.end();
	});*/
	expressServer.use('/', express.static(__dirname + '/client'));
	expressServer.get('*', function (req, res) {
		res.redirect('/');
	});
});

httpServer.listen(80);
