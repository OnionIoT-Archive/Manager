'use strict';

var controllers = angular.module('manager.controllers', []);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'sha3', 'session', function($scope, $state, socket, sha3, session) {

	var clearFields = function () {
		$scope.loginFailed = false;
		$scope.signupFailed = false;
		$scope.pwResetSent = false;
		$scope.email = '';
		$scope.password = '';
	};

	// Switching between Login, Signup and Forgot Password
	$scope.mode = 'login';

	$scope.switchMode = function (mode, $event) {
		if ($event) $event.preventDefault();

		clearFields();
		$scope.mode = mode;
	};	

	// Login
	$scope.login = function () {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);

		socket.rpc('LOGIN', {
			email: email,
			hash: pwHash
		}, function (data) {
			clearFields();
			// Add session token to local storage
			session.login(data.token);
		}, function () {
			$scope.password = '';
			$scope.loginFailed = true;
		});
	};

	// Sign Up
	$scope.signUp = function () {
		console.log('signing up');
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);

		socket.rpc('SIGNUP', {
			email: email,
			hash: pwHash
		}, function () {
			clearFields();
			$scope.switchMode('login');
		}, function () {
			$scope.signupFailed = true;
		})
	};

	// Password Reset
	$scope.forgotPassword = function () {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		socket.emit('FORGOT_PASSWORD', {
			email: email
		});
	};
	socket.on('PASSWORD_RESET_SUCCESS', function () {
		$scope.pwResetSent = true;
	});
	socket.on('PASSWORD_RESET_FAIL', function () {
		$scope.loginFailed = true;
	});
}]);

controllers.controller('TestCtrl', ['$scope', 'socket', function ($scope, socket) {
	$scope.signup = function () {
		socket.emit('SIGNUP', {});
	};
}]);

controllers.controller('CpCtrl', ['$scope', '$state', 'socket', 'session', 'tabItems', 'userProfile', function ($scope, $state, socket, session, tabItems, userProfile) {
	$scope.tabItems = angular.copy(tabItems);

	$scope.userProfile = angular.copy(userProfile);

	// Determin whether the current tab is active or not
	$scope.isActive = function (sref) {
		return ($state.current.name.search(sref) !== -1) ? true : false;
	};

	$scope.logout = function ($event) {
		$event.preventDefault();
		session.logout();
	};
}]);

controllers.controller('DevicesListCtrl', ['$scope', '$state', 'socket', function ($scope, $state, socket) {

}]);

controllers.controller('DevicesEditCtrl', ['$scope', '$state', 'socket', function ($scope, $state, socket) {

}]);