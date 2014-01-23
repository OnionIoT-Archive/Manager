'use strict';

var app = angular.module('manager', ['ui.router', 'ui.bootstrap', 'LocalStorageModule','manager.controllers', 'manager.services', 'manager.directives', 'manager.filters']);

app.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $stateProvider, $urlRouterProvider) {
    // Enable HTML5 mode
    //$locationProvider.html5Mode(true);

	/*** Login ***/
    $stateProvider.state('login', {
    	url: '/login',
    	templateUrl: './partials/login.html',
        resolve: {
            loggedIn: ['localStorageService', function (localStorage) {
                return !!localStorage.get('OnionSessionToken');
            }]
        },
        controller: 'LoginCtrl'
    });

    /*** Control Panel ***/
    $stateProvider.state('cp', {
        abstract: true,
    	templateUrl: './partials/cp.html'
    });

    $stateProvider.state('cp.dashboard', {
    	url: '^/dashboard',
    	templateUrl: './partials/cp.dashboard.html'
    });

    $stateProvider.state('cp.devices', {
        url: '^/devices',
        abstract: true,
        template: '<ui-view />'
    }).state('cp.devices.list', {
        url: '',
        templateUrl: './partials/cp.devices.list.html',
        controller: 'DevicesListCtrl'
    }).state('cp.devices.edit', {
        url: '/:deviceId',
        templateUrl: './partials/cp.devices.edit.html',
        controller: 'DevicesEditCtrl'
    });

    $stateProvider.state('cp.services', {   
    	url: '^/services',
    	templateUrl: './partials/cp.services.html'
    });

    $stateProvider.state('cp.settings', {
    	url: '^/settings',
    	templateUrl: './partials/cp.settings.html'
    });

    $stateProvider.state('cp.profile', {
    	url: '^/profile',
    	templateUrl: './partials/cp.profile.html'
    });

    $stateProvider.state('test', {
        url: '^/test',
        templateUrl: './partials/test.html',
        controller: 'TestCtrl'
    });

	$urlRouterProvider.otherwise('/dashboard');

}]);

