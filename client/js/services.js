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

	$rootScope.$watch('session', function () {
		if ($rootScope.session.loggedIn === true && $state.current.name === 'login') $state.go('cp.dashboard');
		else if ($rootScope.session.loggedIn === false && $state.current.name !== 'login') $state.go('login');
	});

	socket.on('HAS_SESSION', function () {
		$rootScope.session.loggedIn = true;
	});

	socket.on('NO_SESSION', function () {
		$rootScope.session.loggedIn = false;
	});

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
		localStorageService.clearAll();
		$rootScope.session.loggedIn = false;
	};

	return {
		session: $rootScope.session,
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
