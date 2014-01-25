'use strict';

var test = angular.module('manager.test', []);

test.controller('TestCtrl', ['$scope', 'socket', function ($scope, socket) {
	$scope.signup = function () {
		socket.emit('SIGNUP', {
			email:'ha@onion.io',
			hash:'111'
		});
	};
	
	$scope.login = function () {
		socket.emit('LOGIN', {
			email:'bl@onion.io',
			hash:'5f16f4c7f149ac4f9510d9cf8cf384038ad348b3bcdc01915f95de12df9d1b02'
		});
	};
	
	$scope.logout = function () {
		socket.emit('LOGOUT', {
			token:'fc78a0b0-853d-11e3-8a11-6dcf27baeba9'
		});
	};
	
	$scope.check_session = function () {
		socket.emit('CHECK_SESSION', {
			token:'5b4d3020-8614-11e3-90de-d75a85d927ca'
		});
	};
	
	$scope.forgor_password = function () {
		socket.emit('FORGOT_PASSWORD', {});
	};
	$scope.get_device = function () {
		socket.emit('GET_DEVICE', {});
	};
	$scope.add_device = function() {
		var _endpoint = {
			on : {
				type : 'function',
				value : 1,
				method : 'GET'
			},
			off : {
				type : 'function',
				value : 2,
				method : 'GET'
			}
		}
		socket.emit('ADD_DEVICE', {
			id : 'String',
			key : 'String',
			endpoint : _endpoint,
			name : 'String',
			date : new Date(),
			userId : 'String'
		});
	};

	$scope.update_device = function() {
		socket.emit('DB_UPDATE_DEVICE', {
			condition : {
				_id : '52e2c45713f098956d370d0a'
			},
			update : {
				name : 'new name by id'
			}
		});
	};

	$scope.remove_device = function() {
		socket.emit('REMOVE_DEVICE', {
			_id : '52e2c45713f098956d370d0a'
		});
	};

}]);
