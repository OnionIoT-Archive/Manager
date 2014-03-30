'use strict';

// SockJS with Express 3
var express = require('express'),
	socket = require('socket.io'),
	http = require('http'),
	url = require('url'),
	https = require('https'),
	fs = require('fs'),
	forums = require('./server/forums'),
	realtime = require('./server/realtime');
	var config = require('./config');
	var config = config.init();

// creating SSL options
var sslOptions = {
    key: fs.readFileSync('/etc/onion-ssl/onion.io.key.pem'),
    cert: fs.readFileSync('/etc/onion-ssl/onion.io.crt.pem'),
    ca: fs.readFileSync('/etc/onion-ssl/gd_bundle-g2-g1.crt')
};

// Create servers
var httpExpressServer = express();
var httpsExpressServer = express();

var httpServer = http.createServer(httpExpressServer);
var httpsServer = https.createServer(sslOptions, httpsExpressServer);

var socketServer = socket.listen(httpsServer, {
	log : false
});

realtime.init(socketServer);

httpsExpressServer.use(express.cookieParser());
httpsExpressServer.use(express.session({
	secret : 'onion.io'
}));

/***** HTTP server *****/

// Configure the express server
httpsExpressServer.configure(function() {
	//httpsExpressServer.use(express.basicAuth('dev', 'philosophy'));
	httpsExpressServer.use('/', express.static(__dirname + '/client'));
	httpsExpressServer.get('/forums/:message/:timestamp/:signature', forums.static);
	httpsExpressServer.get('*', function(req, res) {
		res.redirect('/');
	});
});

// Redirect all traffic to https
httpExpressServer.all('*', function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
    	//Harry reomved the heades
    	var hostname = url.parse('https://' + req.headers['host'] + req.url).hostname;
        res.redirect('https://'+ hostname);
       
    } else {
        next();
    }
});
httpServer.listen(config.port);
httpsServer.listen(443);