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
controllers.controller('AppLoginCtrl', ['$scope', 'socket',
function($scope, socket) {
	var self = this;
	socket.on('test', function(data) {
		self.test = data.data;
	});
	socket.on('isLogin', function(data) {
		if (data.status) {
			self.status = "succsss!";
		} else {
			self.status = "fail please try again!";
		}
	});
	this.authen = function(email, password) {
		console.log(email);
		console.log(password);
		socket.emit('login', {
			email : email,
			password : password
		});
	}
}]);
