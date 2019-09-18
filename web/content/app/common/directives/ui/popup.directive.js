(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjPopup', PopupDirective)
		.directive('pjPopupPanel', PopupPanelDirective)
	;


	function PopupDirective(){
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'common/directives/ui/popup.html',
			controller: function($scope){
				$scope.transclude = null;

				this.onShow = function(cb){
					this.onShowCallback = cb;
				};
				this.onHide = function(cb){
					this.onHideCallback = cb;
				}
			},
			scope: true,
			transclude: true,
			link: function(scope, elem, attrs, ctrls, transclude){
				ctrls.transclude = transclude;
				ctrls.element = elem;

				var hide = function(event){
					event.preventDefault();
					scope.showPanel = false;
					scope.$evalAsync();
					$(document).off('click', hide);
					$(document).off('mousedown', hide);
					scope.offShowModal && scope.offShowModal();
					ctrls.onHideCallback && ctrls.onHideCallback();
				}

				scope.hide = hide;

				elem.on('click', function(event){
					event.stopPropagation();
					scope.showPanel = !scope.showPanel;
					scope.$evalAsync();
					if(scope.showPanel){
						$(document).on('mousedown', hide);
						$(document).on('click', hide);
						scope.offShowModal = scope.$root.$on('showModal', hide);
						ctrls.onShowCallback && ctrls.onShowCallback();
					} else {
						hide(event);
					}
				})
			}
		}
	}

	function PopupPanelDirective(){
		return {
			restrict: 'EA',
			replace: true,
			require: '^pjPopup',
			templateUrl: 'common/directives/ui/popupPanel.html',
			link: function(scope, elem, attrs, popupCtrl){

				scope.$watch(function(){
					return popupCtrl.transclude;
				}, function(transclude){
					transclude && transclude(scope, function( clone){
						elem.append(clone);
					});
					$(document.body).append(elem[0]);
				});

				var clickHandler = function(event){
					//if(event.target != elem[0]) return true;
					event.stopPropagation();
				}

				popupCtrl.onShow(function(){
					var pos = $(popupCtrl.element[0]).offset(),
						height = $(popupCtrl.element[0]).height();
					elem.css({left: pos.left, top: pos.top + height});
					elem.on('mousedown', clickHandler);
					elem.on('click', clickHandler);
				});
				popupCtrl.onHide(function(){
					elem.off('mousedown', clickHandler);
					elem.off('click', clickHandler)
				});
			}
		}
	}
})();
