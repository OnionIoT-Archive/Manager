'use strict';

var services = angular.module('manager.services', []);

services.constant('TabItems', [
	{
		title: 'Dashboard',
		icon: 'dashboard',
		sref: 'cp.dashboard'
	},
	{
		title: 'Devices',
		icon: 'puzzle-piece',
		sref: 'cp.devices'
	},
	{
		title: 'Services',
		icon: 'tasks',
		sref: 'cp.services'
	},
	{
		title: 'Settings',
		icon: 'cogs',
		sref: 'cp.settings'
	}
]);

services.constant('UserProfile', {
	email: 'bl@onion.io'
});