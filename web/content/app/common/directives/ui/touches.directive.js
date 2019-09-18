(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('ngTouchstart', TouchStartDirective)
		.directive('ngTouchmove', TouchMoveDirective)
		.directive('ngTouchend', TouchEndDirective)
	;

	function TouchStartDirective(){
		return {
			restrict: 'A',
			link: function(scope, elm, attr){
				elm.on('touchstart', function(event){
					scope.$apply(function(){
						scope.$event = event;
						scope.$eval(attr.ngTouchstart);
					}, event);
				});
			}
		}
	}

	function TouchMoveDirective(){
		return {
			restrict: 'A',
			link: function(scope, elm, attr){
				elm.on('touchmove', function(event){
					scope.$apply(function(){
						scope.$event = event;
						scope.$eval(attr.ngTouchstart);
					}, event);
				});
			}
		}		
	}

	function TouchEndDirective(){
		return {
			restrict: 'A',
			link: function(scope, elm, attr){
				elm.on('touchend', function(event){
					scope.$apply(function(){
						scope.$event = event.originalEvent;
						scope.$eval(attr.ngTouchstart);
					}, event);
				});
			}
		}

	}
})();
