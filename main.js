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
var config = {};
var services = require('./server/services');
try {
    config = require('/etc/onionConfig.json').CP;
} catch (err) {
    console.log(err);
    throw "Config file not found. Clone the server-config project form git and follow README";
}

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
    log: false
});

realtime.init(socketServer);

httpsExpressServer.use(express.bodyParser());
httpsExpressServer.use(express.cookieParser());
httpsExpressServer.use(express.session({
    secret: config.HTTPS_SECRET
}));

/***** HTTP server *****/

// Configure the express server

httpsExpressServer.configure(function() {
    //httpsExpressServer.use(express.basicAuth('dev', 'philosophy'));

    httpsExpressServer.use('/', express.static(__dirname + '/client'));
    httpsExpressServer.use('/m', express.static(__dirname + '/client/mobile'));
    httpsExpressServer.use('/bower_components', express.static(__dirname + '/bower_components'));
    httpsExpressServer.get('/milkscale', function(req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.json({
            "weight": 8
        });
    });
    httpsExpressServer.get('/forums/:message/:timestamp/:signature', forums.static);

    httpsExpressServer.get('*', function(req, res) {
        res.redirect('/');
    });

    httpsExpressServer.post('/bell', function(req, res) {
        console.log("/bell");
        services.bellPush();
        res.end('{}');

    });

    httpsExpressServer.post('/milkscale', function(req, res) {
        console.log("milkscale");
        console.log(req.body.value);
        if (req.body.value < 30) {
            services.miklPusher();
        }
        res.end('{}');
    });

    httpsExpressServer.post('/trigger', function(req, res) {
        services.pushBullet();
        console.log('trigger2');
        res.end('{}');
    });

});

// Redirect all traffic to https
httpExpressServer.all('*', function(req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        //Harry reomved the heades

        var hostname = url.parse('https://' + req.headers['host'] + req.url).hostname;
        var path = url.parse('https://' + req.headers['host'] + req.url).path;
        res.redirect('https://' + hostname + path);

    } else {
        next();
    }
});
httpServer.listen(config.HTTP_PORT);
httpsServer.listen(config.HTTPS_PORT);
