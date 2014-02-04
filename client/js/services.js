'use strict';

var services = angular.module('manager.services', []);

services.factory('auth', ['$rootScope', '$state', 'localStorageService', 'socket', 'sha3', function ($rootScope, $state, localStorageService, socket, sha3) {
	$rootScope.loggedIn = false;

	// Callbacks to check if system still logged in and log out if not
	var check = function () {
		if ($rootScope.loggedIn === true && $state.current.name === 'login') $state.go('cp.devices.list');
		else if ($rootScope.loggedIn === false && $state.current.name !== 'login') $state.go('login');
	};

	$rootScope.$watch('loggedIn', check);
	$rootScope.$on('$stateChangeSuccess', check);

	// Get token and check against server to see if session has expired
	var token = localStorageService.get('OnionSessionToken');
	console.log(token);
	if (token) {
		socket.on('CONNECTED', function () {
			socket.removeAllListeners('CONNECTED');

			socket.rpc('CHECK_SESSION', {
				token: token
			}, function () {
				$rootScope.loggedIn = true;
			}, function () {
				$rootScope.loggedIn = false;
				localStorageService.clearAll();
			});
		});
	}

	var login = function (email, password, passCallback, failCallback) {
		if (!passCallback) passCallback = angular.noop;
		if (!failCallback) passCallback = angular.noop;
		var passwordHash = sha3(password);

		socket.rpc('LOGIN', {
			email: email,
			hash: passwordHash
		}, function (data) {
			localStorageService.add('OnionSessionToken', data.token);
			console.log(localStorageService.get('OnionSessionToken'));
			$rootScope.loggedIn = true;
			passCallback();
		}, function (data) {
			failCallback();
		});
	};

	var logout = function () {
		console.log(token);
		socket.rpc('LOGOUT', {
			token: token
		}, function () {
			localStorageService.clearAll();
			$rootScope.loggedIn = false;
		});
	};

	return {
		login: login,
		logout: logout
	};
}]);

services.factory('socket', ['$rootScope', function ($rootScope) {
	if (angular.isDefined(window.io)) {
		var socket = io.connect();

		var on = function (eventName, callback) {
			socket.on(eventName, function (data) {
				callback(data);
			});
		};

		var once = function (eventName, callback) {
			socket.on(eventName, function (data) {
				socket.removeAllListeners(eventName);
				callback(data);
			});
		};

		var emit = function (eventName, data, callback) {
			if (!callback) callback = angular.noop;
			socket.emit(eventName, data, function (data) {
				callback(data);
			})
		};

		var rpc = function (functionName, data, passCallback, failCallback) {
			if (typeof data === 'function') {
				failCallback = passCallback;
				passCallback = data;
				data = {};
			}

			if (!failCallback) {
				failCallback = angular.noop;
			}

			var removeListeners = function () {
				socket.removeAllListeners(functionName + '_PASS');
				socket.removeAllListeners(functionName + '_FAIL');
			};

			socket.on(functionName + '_PASS', function (data) {
				$rootScope.$apply(function () {
					passCallback(data);
				});
				removeListeners();
			});

			socket.on(functionName + '_FAIL', function (data) {
				$rootScope.$apply(function () {
					failCallback(data);
				});
				removeListeners();
			});

			socket.emit(functionName, data);
		};

		return {
			on: on,
			once: once,
			emit: emit,
			rpc: rpc,
			removeAllListeners: socket.removeAllListeners
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
