var PushBullet = require('pushbullet');
var pushBullet = function(arg) {
	console.log('push start');
	var pusher = new PushBullet('v1Z2OrAr4sfaY0AAnpU5q1oBa68v8oeZgbujC2CcKgmHc');
	pusher.devices(function(error, response) {
		for (var i = 0; i < response.devices.length; i++) {
			var device = response.devices[i];
			pusher.note(device.iden, "Someone knock the door", "someone knock the door", function(error, response) {
			});
		}

	});
};

module.exports = {
	pushBullet : pushBullet
};
