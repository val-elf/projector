(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjModalHeader', function(){
			return {
				restrict: 'E',
				transclude: true,
				template: '<div class="modal-header"><div class="modal-title" ng-transclude></div><div class="icon close-icon" ng-click="$dismiss()"></div></div>'
			}
		})
	;
})();
