(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('checkbox', ProjectorCheckboxDirective)
	;

	function ProjectorCheckboxDirective(){
		return {
			restrict: 'A',
			replace: true,
			require: '?ngModel',
			priority: 1000,
			scope: {
				ngChange: '&',
				checked: '@'
			},
			transclude: true,
			template: '<span class="pj-input checkbox" ng-click="toggleCheck($event)"><input type="checkbox" class="hidden" ng-checked="state"><span class="icon16" ng-class="{checked : state}"></span></span>',
			controller: function(){

			},
			link: function(scope, elem, attr, ngModelCtrl){
				if(ngModelCtrl){
					ngModelCtrl.$render = function(){
						scope.state = ngModelCtrl.$modelValue;
					}
					delete attr.ngChange;
				}

				angular.extend(scope, {
					state: false,
					toggleCheck: function(evt){
						if(elem.attr("disabled")) return;
						this.state = !this.state;
						if(ngModelCtrl){
							ngModelCtrl.$setViewValue(this.state);
							scope.ngChange();
						}
						evt.preventDefault();
					}
				});
			}
		}
	}
})();
