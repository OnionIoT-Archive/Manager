'use strict';

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
	service : "Gmail",
	auth : {
		user : "harry@onion.io",
		pass : "Aa!123456"
	}
});

module.exports = {
	smtpTransport: smtpTransport
};