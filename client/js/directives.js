'use strict';

var directives = angular.module('manager.directives', []);

directives.directive('testEnabled', ['test', function (test) {
	return {
		restrict: 'C',
		transclude: true,
		replace: false,
		template: '<div ng-transclude></div>',
		scope: {

		},
		controller: [function () {

		}],
		link: function (scope, element, attrs) {
			
		}
	};
}]);

directives.directive('testToolbar', ['test', function (test) {
	return {
		restrict: 'EA',
		transclude: true,
		replace: false,
		require: '^testEnabled',
		template: '<div ng-transclude></div>',
		link: function (scope, element, attrs, testCtrl) {
			
		}
	};
}]);

