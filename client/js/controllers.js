'use strict';

var controllers = angular.module('manager.controllers', []);

controllers.controller('NavCtrl', ['$scope', '$state', 'tabItems', 'userProfile',
function($scope, $state, tabItems, userProfile) {
	$scope.tabItems = angular.copy(tabItems);

	$scope.userProfile = angular.copy(userProfile);

	// Determin whether the current tab is active or not
	$scope.isActive = function(sref) {
		return ($state.current.name.search(sref) !== -1) ? true : false;
	};
}]);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'sha3', 'localStorageService',
function($scope, $state, socket, sha3, localStorage) {

	// Switching between Login, Signup and Forgot Password
	$scope.mode = 'login';

	$scope.switchMode = function ($event, mode) {
		$event.preventDefault();
		$scope.email = '';
		$scope.password = '';
		$scope.mode = mode;
	};

	socket.on('LOGIN_SUCCESS', function (data) {
		console.log('login success');
		// Add session token to local storage
		localStorage.add('OnionSessionToken', data.token);
		$state.go('/dashboard');
	});

	socket.on('LOGIN_FAIL', function () {
		console.log('login fail');
		$scope.loginFailed = true;
	});

	socket.on('SIGNUP_SUCCESS', function () {
		console.log('signup success');
		$scope.loginFailed = true;
	});

	socket.on('SIGNUP_FAIL', function () {
		console.log('signup fail');
		$scope.loginFailed = true;
	});

	$scope.login = function () {
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
		socket.emit('LOGIN', {
			email: email,
			hash: pwHash
		});
	};

	$scope.signUp = function () {
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
		socket.emit('SIGNUP', {
			email: email,
			hash: pwHash
		});
	};

	$scope.forgotPassword = function () {
		var email = $scope.email.toLowerCase();
		socket.emit('FORGOT_PASSWORD', {
			email: email
		});
	};
}]);

controllers.controller('DevicesListCtrl', ['$scope', '$state', 'socket', 
function ($scope, $state, socket) {

}]);