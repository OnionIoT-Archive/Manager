'use strict';

var filters = angular.module('manager.filters', []);

filters.filter('gfm', ['marked', function (marked) {
	return function (input) {
		return marked(input);
	};
}]);