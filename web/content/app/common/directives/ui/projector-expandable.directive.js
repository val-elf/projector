(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjExpandable', ProjectorExpandableDirective)
		.directive('pjExpandableHead', ProjectorExpandableHeadDirective)
		.directive('pjExpandableBody', ProjectorExpandableBodyDirective)
		.controller('ProjectorExpandableHeadController', ProjectorExpandableHeadController)
	;

	function ProjectorExpandableDirective() {
		return {
			restcit: 'E',
			replace: true,
			transclude: true,
			require: 'pjExpandable',
			scope: true,
			controller: function(){
				this.setExpanded = function(value){
					this.isExpanded = value;
					this.bodyControl.setExpanded(value);
				}
			},
			controllerAs: 'expandedCtrl',
			template: '<div class="expandable" ng-class="{expanded: expandedCtrl.isExpanded}" ng-transclude></div>',
		}
	}

	function ProjectorExpandableHeadDirective() {
		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			require: ['^pjExpandable', 'pjExpandableHead'],
			controller: 'ProjectorExpandableHeadController as exHeadCtrl',
			templateUrl: 'common/directives/ui/projector-expandable-head.html',
			scope: {
				pjDisabled: '='
			},
			link: function(scope, elem, attr, ctrls){
				var prnt = ctrls[0], own = ctrls[1];
				own.elem = $(elem[0]);
				own.prnt = prnt;
			}
		}
	}

	function ProjectorExpandableHeadController($scope){
		var vm = this;
		angular.extend(vm, {
			isExpanded:false,
			toggleExpanded: function(){
				if($scope.pjDisabled) return;
				vm.isExpanded = !vm.isExpanded;
				this.prnt.setExpanded(vm.isExpanded);
			}			
		})
	}

	function ProjectorExpandableBodyDirective() {
		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			require: ['^pjExpandable', 'pjExpandableBody'],
			scope: {
				maxHeight: '@'
			},
			controller: function(){
				var vm = this;
				angular.extend(this, {
					setExpanded: function(value){
						this.expanded = value;
						if(value){							
							var clone = this.elem.clone();
							clone.addClass("mesure");
							clone.css({height: ''});
							this.elem.parent().append(clone);
							setTimeout(function(){
								var height = clone.height();
								vm.elem.css({height: height});
								clone.remove();
							});
						} else {
							vm.elem.css({height: 0});
						}
					},
					applyContentHeight: function(height){
						if(this.expanded) {
							var oldheight = vm.elem.height();
							var clone = this.elem.clone();
							clone.addClass("mesure");
							clone.css({height: 'auto'});
							this.elem.parent().append(clone);
							setTimeout(function(){
								var aheight = clone.height();
								vm.elem.css({height: aheight});
								clone.remove();
							});
						}
					}
				})
			},
			template: '<div class="expanded-body" scrollable max-height="maxHeight" style="height:0"><div class="extendable-content" ng-transclude></div></div>',
			link: function(scope, elem, attr, ctrls){
				var exctrl = ctrls[0], own = ctrls[1], content;
				exctrl.bodyControl = own;
				own.elem = $(elem[0]);
				content = own.elem.find(".extendable-content");

				scope.$watch(function(){
					return content.outerHeight();
				}, function(height, prev){
					own.applyContentHeight(height);
				})
			}
		}
	}
})();
