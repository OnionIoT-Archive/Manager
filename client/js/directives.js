'use strict';

var directives = angular.module('manager.directives', []);

directives.directive('showTest', ['test', function (test) {
	return {
		restrict: 'A',
		transclude: true,
		replace: true,
		template: '<div ng-transclude ng-class="{\'test-enabled\': showTest}"></div>',
		scope: {
			showTest: '='
		},
		link: function (scope, element, attrs) {
			
		}
	};
}]);
