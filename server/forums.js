'use strict';

module.exports = {
	static: function(req, res) {
		res.end('<!doctype html><html><head><link rel="stylesheet" type="text/css" href="//cdn.moot.it/1/moot.css" /><link rel="stylesheet" type="text/css" href="/css/forums.css" /><meta name="viewport" content="width=device-width" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><script src="//cdn.moot.it/1/moot.min.js"></script></head><body><a id="moot" href="https://moot.it/i/onion">Onion Forums</a><script>$("#moot").moot({api: {key: "aaFn5b4rnM", signature: "' + req.params.signature + '", message: "' + req.params.message + '", timestamp: "' + req.params.timestamp + '"}});</script></body></html>');
	}
};