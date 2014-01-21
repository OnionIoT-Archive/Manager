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
controllers.controller('LoginCtrl', ['$scope', 'socket',
function($scope, socket) {
	var self = this;
	console.log($scope.user);
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
	this.authen = function() {
		socket.emit('login', {
			email : $scope.user.email,
			password : $scope.user.password
		});
	}
}]);
