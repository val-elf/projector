(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('textEdited', TextEditedDirective)
		.controller('TextEditedController', TextEditedController)
	;


	function TextEditedDirective(){
		return {
			restrict: 'E',
			replace: true,
			require: '^?ngModel',
			controller: TextEditedController,
			controllerAs: 'textEditedCtrl',
			transclude: true,
			scope: {
				locked: '=',
				teChange: '&',
				emptyValue: '@'
			},
			templateUrl: 'common/directives/ui/text-edited.html',
			link: function(scope, element, attrs, ngModelCtrl, transclude) {
				scope.inputField = element.find("input");
				scope.ngModelCtrl = ngModelCtrl;
				scope.container = element[0].querySelector('span.actioned');
				scope.type = attrs.type;
				scope.viewValue = scope.emptyValue;
				if(ngModelCtrl){
					ngModelCtrl.$render = function() {
						scope.editValue = ngModelCtrl.$modelValue;
						scope.viewValue = scope.editValue || scope.emptyValue || '';
					}
				}

				scope.inputField.on('keypress', function(event){
					if(event.keyCode == 13){
						scope.inputField[0].blur();
						//scope.changeNgValue();
					}
				})
			}
		}
	}

	function TextEditedController($scope){
		angular.extend($scope, {
			hovered: false,
			edited: false,
			showEdit: function(){
				$scope.hovered = true;
			},
			hideEdit: function(){
				$scope.hovered = false;
			},
			editMode: function(){
				if($scope.locked) return;
				$scope.edited = true;
				$scope.inputField.removeClass("hidden");
				$scope.inputField[0].focus();
				$scope.inputField[0].style.width = ($scope.container.offsetWidth + 10)+ 'px';
			},
			changeNgValue: function(){
				$scope.viewValue = $scope.editValue || $scope.defaultValue;
				$scope.ngModelCtrl && $scope.ngModelCtrl.$setViewValue($scope.editValue);
			},
			updateChange: function(){
				$scope.edited = false;
				$scope.inputField.addClass("hidden");
				if($scope.ngModelCtrl.$dirty){
					$scope.teChange($scope);
					$scope.ngModelCtrl.$setPristine();
				}
			}
		});
	}
}());