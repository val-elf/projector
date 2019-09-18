(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('commonButtons', CommonButtonsDirective)
	;

	function CommonButtonsDirective(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'common/directives/ui/common-buttons.html'
		}
	}
}());