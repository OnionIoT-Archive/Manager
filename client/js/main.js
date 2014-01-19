'use strict';

var app = angular.module('manager', ['ui.router', 'ui.bootstrap', 'manager.controllers', 'manager.services', 'manager.directives', 'manager.filters']);

app.config(['$stateProvider', '$urlRouterProvider', function (stateProvider, urlRouterProvider) {

	// Login
    stateProvider.state('login', {
    	url: '/login',
    	templateUrl: './partials/login.html'
    });

    // Control Panel
    stateProvider.state('cp', {
    	templateUrl: './partials/cp.html'
    }).state('cp.dashboard', {
    	url: '/dashboard',
    	templateUrl: './partials/cp.dashboard.html'
    }).state('cp.devices', {
    	url: '/devices',
    	templateUrl: './partials/cp.devices.html'
    }).state('cp.services', {
    	url: '/services',
    	templateUrl: './partials/cp.services.html'
    }).state('cp.settings', {
    	url: '/settings',
    	templateUrl: './partials/cp.settings.html'
    }).state('cp.profile', {
    	url: '/profile',
    	templateUrl: './partials/cp.profile.html'
    });

	urlRouterProvider.otherwise('/dashboard');

}]);

