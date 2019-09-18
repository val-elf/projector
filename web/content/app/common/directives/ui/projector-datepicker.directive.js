(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjDatepicker', ProjectorDatePicker)
		.controller('ProjectorDatepickerController', ProjectorDatepickerController)
	;

	function ProjectorDatePicker(){
		return {
			restrict: 'E',
			require: '^?ngModel',
			scope: {
				ngRequired: '=',
				minDate: '=',
				maxDate: '=',
				ngChange: '&'
			},
			replace: true,
			template: '<span><input readonly datepicker-popup type="text" ng-change="onChange()" ng-model="$value" min-date="minDate" max-date="maxDate" is-open="isOpened" ng-click="openDt()" ng-required="ngRequired"/></span>',
			controller: 'ProjectorDatepickerController as datepickerCtrl',
			link: function($scope, $elm, $attr, ngModelCtrl){

				$scope.onChange = function($event){
					if(ngModelCtrl){
						ngModelCtrl.$setViewValue($scope.$value);
					}
					$scope.ngChange($scope);					
				}

				if(ngModelCtrl){
					ngModelCtrl.$render = function(){
						$scope.$value = ngModelCtrl.$viewValue;
						$scope.$evalAsync();
					}
				}

				angular.extend($scope, {
					openDt: function(){
						$scope.isOpened = true;
					}
				})
			}
		}
	}

	function ProjectorDatepickerController($scope){
	}
}());
