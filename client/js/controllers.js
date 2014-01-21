'use strict';

var controllers = angular.module('manager.controllers', []);

controllers.controller('NavCtrl', ['$state', 'tabItems', 'userProfile',
function($state, tabItems, userProfile) {
	this.tabItems = angular.copy(tabItems);

	this.userProfile = angular.copy(userProfile);

	// Determin whether the current tab is active or not
	this.isActive = function(sref) {
		return ($state.current.name.search(sref) !== -1) ? true : false;
	};
}]);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'sha3', 'localStorageService',
function($scope, $state, socket, sha3, localStorage) {
	var self = this;
	socket.on('test', function(data) {
		self.test = data.data;
	});
	socket.on('LOGIN_SUCCESS', function (data) {
		//TODO create a co		// Add session token to local storage
		localStorage.add('OnionSessionToken', data.token);
		$state.go('cp.dashboard');
	});
	
	socket.on('LOGIN_FAILED', function () {
		console.log('fail');
		self.loginFailed = true;
	});
	socket.on('LOGIN_SUCCESS', function () {
		console.log('pass');
		self.loginFailed = true;
	});
	this.authen = function (email, password) {
		var pwHash = sha3(password);
		socket.emit('LOGIN', {
			email: email,
			hash: pwHash
		});
	}
}]);