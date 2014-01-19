'use strict';

var controllers = angular.module('manager.controllers', []);

controllers.controller('NavCtrl', ['$state', 'TabItems', 'UserProfile', function (state, tabItems, userProfile) {
	this.tabItems = angular.copy(tabItems);

	this.userProfile = angular.copy(userProfile);

	// Determin whether the current tab is active or not
	this.isActive = function (sref) {
		return (state.current.name.search(sref) !== -1) ? true : false;
	};
}]);
