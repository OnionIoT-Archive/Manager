'use strict';

var controllers = angular.module('manager.controllers', []);

controllers.controller('NavCtrl', ['$state', 'tabItems', 'userProfile',
function($state, tabItems, userProfile) {
	this.tabItems = angular.copy(tabItems);

	this.userProfile = angular.copy(userProfile);

	console.log($state);
	// Determin whether the current tab is active or not
	this.isActive = function(sref) {
		return ($state.current.name.search(sref) !== -1) ? true : false;
	};
}]);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'sha3', 'localStorageService',
function($scope, $state, socket, sha3, localStorage) {

	// Switching between Login, Signup and Forgot Password
	this.mode = 'login';

	this.switchMode = function ($event, mode) {
		$event.preventDefault();
		this.mode = mode;
	};

	var self = this;

	socket.on('LOGIN_SUCCESS', function (data) {
		// Add session token to local storage
		localStorage.add('OnionSessionToken', data.token);
		$state.go('/dashboard');
	});

	socket.on('LOGIN_FAIL', function () {
		self.loginFailed = true;
	});

	this.login = function (email, password) {
		email = email.toLowerCase();
		var pwHash = sha3(password);
		socket.emit('LOGIN', {
			email: email,
			hash: pwHash
		});
	};

	this.signUp = function (email, password) {
		email = email.toLowerCase();
		var pwHash = sha3(password);
		socket.emit('SIGNUP', {
			email: email,
			hash: pwHash
		});
	};

	this.forgotPassword = function (email) {
		email = email.toLowerCase();
		socket.emit('FORGOT_PASSWORD', {
			email: email
		});
	};
}]);

controllers.controller('DevicesListCtrl', ['$scope', '$state', 'socket', 
function ($scope, $state, socket) {

}]);