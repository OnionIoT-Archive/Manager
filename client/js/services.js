'use strict';

var services = angular.module('manager.services', []);

services.constant('tabItems', [
	{
		title: 'Dashboard',
		icon: 'dashboard',
		sref: 'cp.dashboard'
	},
	{
		title: 'Devices',
		icon: 'puzzle-piece',
		sref: 'cp.devices.list'
	},
	{
		title: 'Services',
		icon: 'tasks',
		sref: 'cp.services'
	},
	{
		title: 'Settings',
		icon: 'cogs',
		sref: 'cp.settings'
	}
]);

services.constant('userProfile', {
	email: 'bl@onion.io'
});

services.factory('session', ['$rootScope', '$state', 'localStorageService', 'socket', function ($rootScope, $state, localStorageService, socket) {
	$rootScope.session = {
		loggedIn: false
	};

	// Callbacks to check if system still logged in and log out if not
	var check = function () {
		if ($rootScope.session.loggedIn === true && $state.current.name === 'login') $state.go('cp.dashboard');
		else if ($rootScope.session.loggedIn === false && $state.current.name !== 'login') $state.go('login');
	};
	$rootScope.$watch('session', check, true);
	$rootScope.$on('$stateChangeSuccess', check);

	socket.on('HAS_SESSION', function () {
		$rootScope.session.loggedIn = true;
	});

	socket.on('NO_SESSION', function () {
		$rootScope.session.loggedIn = false;
		localStorageService.clearAll();
	});

	// Get token and check against server to see if session has expired
	var token = localStorageService.get('OnionSessionToken');
	if (token) {
		socket.on('CONNECTED', function () {
			socket.emit('CHECK_SESSION', {
				token: token
			});
		});
	}

	var login = function (token) {
		localStorageService.add('OnionSessionToken', token);
		$rootScope.session.loggedIn = true;
	};

	var logout = function () {
		var token = localStorageService.get('OnionSessionToken');
		socket.emit('LOGOUT', {
			token: token
		});
	};

	socket.on('LOGOUT_SUCCESS', function () {
		localStorageService.clearAll();
		$rootScope.session.loggedIn = false;
	});

	return {
		login: login,
		logout: logout
	};
}]);

services.factory('socket', ['$rootScope', function ($rootScope) {
	if (angular.isDefined(window.io)) {
		var socket = io.connect();
		return {
			on: function (eventName, callback) {
				socket.on(eventName, function () {  
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				});
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				})
			},
			rpc: function (functionName, data, callback, passCallback, failCallback) {
				// callback is optional 
				if (!failCallback) {
					failCallback = passCallback;
					passCallback = callback;
					callback = angular.noop;
				}

				var removeListeners = function () {
					socket.removeAllListeners('functionName' + '_PASS');
					socket.removeAllListeners('functionName' + '_FAIL');
				};

				socket.on(functionName + '_PASS', function (data) {
					passCallback(data);
					removeListeners();
				});

				socket.on(functionName + '_FAIL', function (data) {
					failCallback(data);
					removeListeners();
				});

				socket.emit(functionName, data);
			}
		};
	}
}]);

services.factory('sha3', [function () {
	if (angular.isDefined(window.CryptoJS.SHA3)) {
		return function (message) {
			return CryptoJS.SHA3(message, {outputLength: 256}).toString(CryptoJS.enc.Hex);
		};
	}
}]);
