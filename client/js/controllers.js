'use strict';

var controllers = angular.module('manager.controllers', []);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'auth',
function($scope, $state, socket, auth) {

	var clearFields = function() {
		$scope.loginFailed = false;
		$scope.signupFailed = false;
		$scope.pwResetSent = false;
		$scope.email = '';
		$scope.password = '';
	};

	// Switching between Login, Signup and Forgot Password
	$scope.mode = 'login';

	$scope.switchMode = function(mode, $event) {
		if ($event)
			$event.preventDefault();

		clearFields();
		$scope.mode = mode;
	};

	// Login
	$scope.login = function() {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var password = $scope.password;

		auth.login(email, password, function() {
			clearFields();
		}, function() {
			$scope.password = '';
			$scope.loginFailed = true;
		});
	};

	// Sign Up
	$scope.signUp = function() {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);

		socket.rpc('SIGNUP', {
			email : email,
			hash : pwHash
		}, function() {
			clearFields();
			$scope.switchMode('login');
		}, function() {
			$scope.signupFailed = true;
		})
	};

	// Password Reset
	$scope.passwordReset = function() {
		$scope.email = $scope.email || '';
		var email = $scope.email.toLowerCase();
		socket.emit('PWRESET', {
			email : email
		}, function() {
			$scope.pwResetSent = true;
		}, function() {
			$scope.pwResetSent = false;
		});
	};
}]);

controllers.controller('TestCtrl', ['$scope', 'socket',
function($scope, socket) {
	$scope.signup = function() {
		socket.emit('SIGNUP', {});
	};
}]);

controllers.controller('CpCtrl', ['$scope', '$state', 'socket', 'auth', 'tabItems', 'userProfile',
function($scope, $state, socket, auth, tabItems, userProfile) {
	$scope.tabItems = angular.copy(tabItems);

	$scope.userProfile = angular.copy(userProfile);

	// Determin whether the current tab is active or not
	$scope.isActive = function (root) {
		return ($state.current.name.search(root) !== -1) ? true : false;
	};

	$scope.logout = function($event) {
		$event.stopPropagation();
		$event.preventDefault();
		auth.logout();
	};
}]);

controllers.controller('DevicesListCtrl', ['$scope', '$timeout', '$state', 'socket', function ($scope, $timeout, $state, socket) {
	$scope.devices = [];
	socket.rpcCached('LIST_DEVICES', function (data) {
		$scope.devices = data;
	});

	$scope.toggleSelection = function ($event) {
		if ($event) $event.preventDefault();

		var selectedAll = true;
		angular.forEach($scope.devices, function (value, key) {
			// Test if everything is selected
			selectedAll = selectedAll && value.selected;
		});

		if (selectedAll) {
			angular.forEach($scope.devices, function (value, key) {
				// Test if everything is selected
				value.selected = false;
			});
		} else {
			angular.forEach($scope.devices, function (value, key) {
				// Test if everything is selected
				value.selected = true;
			});
		}
	};
}]);

controllers.controller('DevicesEditCtrl', ['$scope', '$stateParams', 'socket', function ($scope, $stateParams, socket) {
	var device = {};

	socket.rpcCached('GET_DEVICE', {
		_id: $stateParams.deviceId
	}, function (data) {
		console.log(data);
	})
}]);