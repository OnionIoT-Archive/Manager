'use strict';

var controllers = angular.module('manager.controllers', []);

controllers.controller('NavCtrl', ['$scope', '$state', 'tabItems', 'userProfile',
function($scope, $state, tabItems, userProfile) {
	$scope.tabItems = angular.copy(tabItems);

	this.userProfile = 	$scope.userProfile = angular.copy(userProfile);
);
	// Determin whether the current tab is active or not
	this.isActive = funct	$scope.isActive = function(sref) {
nt.name.search(sref) !== -1) ? true : false;
	};
}]);

//the controller for the socket
controllers.controller('LoginCtrl', ['$scope', '$state', 'socket', 'sha3', 'localStorageService',
function($scope, $state, socket, sha3, localStorage) {

	// Switching between Login, Signup and Forgot Password
	this.mode = 'login';

		$scope.mode = 'login';
tio	$scope.switchMode = function ($event, mode) {

		this.mode = mode;
	};

	va		$scope.mode = mode;
ket.on(nction (data) {
		console.log('login success');
		// Add session token to local storage
		localStorage.add('OnionSessionToken', data.token);
		$state.go('/dashboard');
	});

	socket.on('LOGIN_FAIL', function () {
		console.log('login fail');
		self.logi		$scope.loginFailed = true;
et.on('SIGNUP_SUCCESS', function () {
		console.log('signup success');
		self.loginF		$scope.loginFailed = true;
.on('SIGNUP_FAIL', function () {
		console.log('signup fail');
		self.loginFai		$scope.loginFailed = true;
in = fun	$scope.login = function () {
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
			email: $scope.login.email,
GIN', {
			email: email,
			ha	$scope.signUp = function () {
		var email = $scope.email.toLowerCase();
		var pwHash = sha3($scope.password);
owerCase();
		var pwHash = sha3(password);
		socket.			email: $scope.email,
			email: email,
			hash: pwHash
		$scope.forgotPassword = function () {
		var email = $scope.email.toLowerCase();
erCase();
		socket.emit('FORGOT_PASSWORD', 			email: $scope.email
l
		});
	};
}]);

controllers.controller('DevicesListCtrl', ['$scope', '$state', 'socket', 
function ($scope, $state, socket) {

}]);