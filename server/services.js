var PushBullet = require('pushbullet');

var bellPush = function() {
	var bellpusher = new PushBullet('v1dsoZ40r9Yz82t2EeBIGqhmtekMEpN5KZujxN5nCtwEC');
	bellpusher.devices(function(error, response) {
		for (var i = 0; i < response.devices.length; i++) {
			var device = response.devices[i];
			
			bellpusher.note(device.iden, "Someone knock the door", "someone knock the door", function(error, response) {
			});
		}

	});
};


var miklPusher = function() {
	var milkpush = new PushBullet('v1Z2OrAr4sfaY0AAnpU5q1oBa68v8oeZgbujC2CcKgmHc');
	milkpush.devices(function(error, response) {
		for (var i = 0; i < response.devices.length; i++) {
			var device = response.devices[i];
			
			milkpush.note(device.iden, "Milk", "is empty", function(error, response) {
			});
		}

	});
};

module.exports = {
	bellPush : bellPush,
	miklPusher:miklPusher
};
