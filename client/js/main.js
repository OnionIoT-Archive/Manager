'use strict';

var app = angular.module('manager', ['ui.router', 'ui.bootstrap', 'LocalStorageModule','manager.controllers', 'manager.services', 'manager.directives', 'manager.filters']);

app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $stateProvider, $urlRouterProvider) {
    // Enable HTML5 mode
    //$locationProvider.html5Mode(true);

    var virtualState = {
        template: '<div ui-view></div>'
    };

	/*** Login ***/
    $stateProvider.state('login', {
    	url: '/login',
    	templateUrl: './partials/login.html'
    });

    /*** Control Panel ***/
    $stateProvider.state('cp', {
    	templateUrl: './partials/cp.html'
    });

    $stateProvider.state('cp.dashboard', {
    	url: '/dashboard',
    	templateUrl: './partials/cp.dashboard.html'
    });

    $stateProvider.state('cp.devices', virtualState)
    .state('cp.devices.list', {
        url: '/devices',
        templateUrl: './partials/cp.devices.list.html'
    })
    .state('cp.devices.edit', {
        url: '/devices/:deviceId',
        templateUrl: './partials/cp.devices.edit.html'
    });

    $stateProvider.state('cp.services', {   
    	url: '/services',
    	templateUrl: './partials/cp.services.html'
    });

    $stateProvider.state('cp.settings', {
    	url: '/settings',
    	templateUrl: './partials/cp.settings.html'
    });

    $stateProvider.state('cp.profile', {
    	url: '/profile',
    	templateUrl: './partials/cp.profile.html'
    });

	$urlRouterProvider.otherwise('/dashboard');

}]);

