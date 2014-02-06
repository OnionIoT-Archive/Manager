'use strict';

var test = angular.module('manager.test', []);

test.controller('TestCtrl', ['$scope', 'socket',
function($scope, socket) {
	$scope.signup = function() {
		socket.emit('SIGNUP', {
			email : 'ha@onion.io',
			hash : '111'
		});
	};

	$scope.login = function() {
		socket.emit('LOGIN', {
			email : 'bl@onion.io',
			hash : '5f16f4c7f149ac4f9510d9cf8cf384038ad348b3bcdc01915f95de12df9d1b02'
		});
	};

	$scope.logout = function() {
		socket.emit('LOGOUT', {
			token : 'fc78a0b0-853d-11e3-8a11-6dcf27baeba9'
		});
	};

	$scope.check_session = function() {
		socket.emit('CHECK_SESSION', {
			token : '5b4d3020-8614-11e3-90de-d75a85d927ca'
		});
	};

	$scope.forgor_password = function() {
		socket.emit('FORGOT_PASSWORD', {});
	};
	$scope.get_device_list = function(fn) {
		socket.emit('LIST_DEVICES', {});
		socket.on('LIST_DEVICES_PASS', function(data) {
			fn(data);
		});
	};

	$scope.get_device = function() {
		this.get_device_list(function(devices) {
			console.log(devices[0]);
			socket.emit('GET_DEVICE', {
				_id : devices[0]._id
			});
			socket.on('GET_DEVICE_PASS', function(data) {
				//console.log(data);
			});
		});

	};

	$scope.add_procedures = function() {
		console.log($scope.deviceId);
		socket.emit('ADD_PROCEDURE', {
			_id : $scope.deviceId
		});
	};

	$scope.add_states = function() {
		console.log('$scope.deviceId');
		socket.emit('ADD_STATES', {
			_id : $scope.deviceId
		});
	};

	$scope.add_device = function() {
		socket.emit('ADD_DEVICE', {
			id : 'id is here',
			key : 'key is here',
			lastUpdate : new Date(),
			userId : 'uer id',
			status : 'status',
			meta : {
				name : 'meta name',
				description : 'meta description',
				location : 'meta location',
				deviceType : 'meta deviceType'
			}
		});
	};

	$scope.update_device = function() {
		socket.emit('DEVICE_UPDATE', {
			condition : {
				_id : $scope.deviceId
			},
			update : {
				meta : {
					name : '$scope.device.meta.name',
					description : '$scopedevice.meta.description'
				}
			}
		});
	};

	$scope.remove_device = function() {
		socket.emit('REMOVE_DEVICE', {
			_id : '52e2c45713f098956d370d0a'
		});
	};

	$scope.new_key = function() {
		socket.emit('RENEW_KEY', {
			_id : $scope.deviceId
		});
		socket.on('RENEW_KEY_PASS', function(data){
			console.log(data.key);
		});	
	};
	
	$scope.add_history = function() {
		console.log('data');
		socket.emit('ADD_HISTORY', {
			action : 'action',
			endpoint:'endpoint',
			deviceId:$scope.deviceId,
			payload:'test'
		});
		socket.on('ADD_HISTORY_PASS', function(data){
			console.log(data);
		});	
	};
	
	$scope.get_history = function() {
		socket.emit('GET_HISTORY', {
			_id : $scope.deviceId
		});
		socket.on('RENEW_KEY_PASS', function(data){
			console.log(data.key);
		});	
	};

}]);
