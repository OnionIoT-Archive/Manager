'use strict';

var controllers = angular.module('manager.controllers', []);

controllers.controller('NavCtrl', ['$scope', '$state', 'tabItems', 'userProfile', function($scope, $state, tabItems, userProfile) {
	$scope.tabItems = angular.copy(tabItems);

	$scope.userProfile = angular.copy(userProfile);

	// Determin whether the current tab is active or not
	$scope.isActive = function(sref) {
		return ($state.current.name.search(sref) !== -1) ? true : false;
	};
}]);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'sha3', 'localStorageService', function($scope, $state, socket, sha3, localStorage) {

	var clearFields = function () {
		$scope.loginFailed = false;
		$scope.signupFailed = false;
		$scope.email = '';
		$scope.password = '';
	};

	// Switching between Login, Signup and Forgot Password
	$scope.mode = 'login';

	$scope.switchMode = function ($event, mode) {
		if ($event) $event.preventDefault();
		clearFields();
		$scope.mode = mode;
	};	

	// Login
	$scope.login = function () {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
		socket.emit('LOGIN', {
			email: email,
			hash: pwHash
		});
	};
	socket.on('LOGIN_SUCCESS', function (data) {
		clearFields();
		// Add session token to local storage
		console.log(data);
		localStorage.add('OnionSessionToken', data.token);
		$state.go('cp.dashboard');
	});
	socket.on('LOGIN_FAIL', function () {
		$scope.password = '';
		$scope.loginFailed = true;
	});

	// Sign Up
	$scope.signUp = function () {
		console.log('signing up');
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
		socket.emit('SIGNUP', {
			email: email,
			hash: pwHash
		});
	};
	socket.on('SIGNUP_SUCCESS', function () {
		clearFields();
		$scope.switchMode(null, 'login');
	});
	socket.on('SIGNUP_FAIL', function () {
		$scope.signupFailed = true;
		clearFields();
	});

	// Password Reset
	$scope.forgotPassword = function () {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		socket.emit('FORGOT_PASSWORD', {
			email: email
		});
	};
	socket.on('PASSWORD_RESET_SUCCESS', function () {
		console.log('signup success');
		$scope.loginFailed = true;
	});
	socket.on('PASSWORD_RESET_FAIL', function () {
		console.log('signup fail');
		$scope.loginFailed = true;
	});
}]);

controllers.controller('TestCtrl', ['$scope', 'socket', function ($scope, socket) {
	$scope.signup = function () {
		socket.emit('SIGNUP', {});
	};
}]);

controllers.controller('CpCtrl', ['$scope', '$state', 'socket', function ($scope, $state, socket) {

}]);

controllers.controller('DevicesListCtrl', ['$scope', '$state', 'socket', function ($scope, $state, socket) {

}]);

controllers.controller('DevicesEditCtrl', ['$scope', '$state', 'socket', function ($scope, $state, socket) {

}]);