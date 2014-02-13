'use strict';

var directives = angular.module('manager.directives', []);

directives.directive('gfm', ['marked', function (marked) {
	return {
		restrict: 'CA',
		link: function (scope, element, attrs) {
			element.html(marked(element.html()));
			console.log(element.html());
			console.log(marked('I am using __markdown__.'));
		}
	};
}]);