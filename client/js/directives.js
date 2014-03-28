'use strict';

var directives = angular.module('manager.directives', []);

directives.directive('showTest', [function () {
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

directives.directive('testLog', ['$rootScope', '$timeout', 'test', function ($rootScope, $timeout, test) {
	return {
		restrict: 'C',
		transclude: true,
		replace: true,
		template: '<div ng-transclude></div>',
		link: function (scope, element, attrs) {
			$rootScope.$watch('logs', function (newValue, oldValue) {
				$timeout(function () {
					element[0].scrollTop = element[0].scrollHeight;
				}, 50);
			}, true);
		}
	};
}]);