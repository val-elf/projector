(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjSelect', ProjectorSelect)
		.directive('pjOption', ProjectSelectOption)
	;

	function ProjectorSelect(){
		return {
			restrict: 'E',
			require: ['?ngModel', 'pjSelect'],
			template: ['<div tabindex="0" class="pj-input select" ng-click="open($event)">',
							'<div class="displayed" ng-bind="displayedValue">{{placeholder}}</div>',
							'<div class="placeholder" ng-if="!displayedValue" ng-bind="placeholder"></div>',
							'<div class="opener"></div>',
							'<div class="popup" ng-transclude></div>',
						'</div>'].join(''),
			controller: ProjectSelectController,
			scope: {
				ngChange: '&',
				placeholder: '@'
			},
			controllerAs: 'selectCtrl',
			transclude: true,
			replace: true,
			priority: 1,
			link: function(scope, elem, attrs, ctrls){
				//check length;
				var ngModelCtrl = ctrls[0], own = ctrls[1];
				scope._elem = $(elem[0]);
				elem.tabIndex = 0;
				var popup = scope._elem.find(".popup");

				scope._popup = popup;
				scope._height = scope._elem.outerHeight();
				scope.ngModelCtrl = ngModelCtrl;

				if(scope.ngModelCtrl){
					scope.ngModelCtrl.$render = function(){
						own.setRawValue(scope.ngModelCtrl.$modelValue);
					};
				}

				var closer = function(event){
					if(event && event.opened && event.opened == elem[0]) return;
					popup.removeClass("active");
					document.removeEventListener('click', closer);
					event && event.stopPropagation();
				};



				angular.extend(scope, {
					open: function($event){
						//elem[0].focus();								
						if(popup.hasClass("active")) return;
						popup.addClass("active");
						document.addEventListener('click', closer);
						$event.opened = elem[0];
						//$event.stopPropagation();
					},
					closePopup: function($event){
						closer($event);
					}
				})
			}
		}
	}

	function ProjectSelectController($scope){
		var options = [], maxWidth = 0, lastValue;
		this.addOption = function(option){
			if(option.selected !== undefined){
				this.setValue(option);
				$scope.$evalAsync();
			} else if(lastValue && option.value == lastValue){
				this.setValue(option);
				$scope.$evalAsync();
			}
			options.push(option);
			var width = $scope._popup.width() + $scope._height;
			if(width > maxWidth){
				$scope._popup.addClass("active");
				$scope._elem.css({width: width});
				$scope._popup.removeClass("active");
				maxWidth = width;
			}
		}


		this.deselectAll = function(){
			options.forEach(function(option){option.deselect();});
		}

		this.setRawValue = function(value){
			lastValue = value;
			if(value === null || value === undefined){
				this.setValue(null);
				return;
			}
			var option = options.find(function(opt){return opt.value == value});
			option && this.setValue(option);
		}

		this.setValue = function(option, $event){
			$scope.value = option && option.value || null;
			$scope.displayedValue = option && option.displayedValue || "";
			$scope.ngModelCtrl && $scope.ngModelCtrl.$setViewValue($scope.value);
			$scope.closePopup && $scope.closePopup($event);
		}
	}

	function ProjectSelectOption(){
		return {
			restrict: 'E',
			require: '^pjSelect',
			scope: {
				selected: '@',
				value: '@'
			},
			replace: true,
			template: '<div ng-transclude class="option" ng-click="select($event)" ng-class="{selected: selected !== undefined && selected !== false}"></div>',
			transclude: true,
			link: function($scope, elem, attrs, selector){				

				if($scope.selected !== undefined && $scope.selected != false) $scope.selected = true;

				$scope.$evalAsync(function(){
					$scope.displayedValue = elem.text();
					selector.addOption($scope);
				})

				$scope.select = function($event){
					selector && selector.deselectAll();
					$scope.selected = true;
					selector && selector.setValue($scope, $event);
				}

				$scope.deselect = function(){
					$scope.selected = false;
				}
			}
		}
	}
})();
