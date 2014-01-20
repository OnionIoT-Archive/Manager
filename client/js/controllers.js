'use strict';

var controllers = angular.module('manager.controllers', []);

controllers.controller('NavCtrl', ['$state', 'tabItems', 'userProfile', 'socket', function ($state, tabItems, userProfile, socket) {
	this.tabItems = angular.copy(tabItems);

	this.userProfile = angular.copy(userProfile);

	// Determin whether the current tab is active or not
	this.isActive = function (sref) {
		return ($state.current.name.search(sref) !== -1) ? true : false;
	};

	socket.on('news', function (data) {
		console.log(data);
		socket.emit('my other event', { my: 'data' });
	});
}]);
