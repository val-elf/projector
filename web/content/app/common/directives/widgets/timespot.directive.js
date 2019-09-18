(function(){
	'use strict';
	angular.module('projector.directives')
		.directive('timeSpot', TimeSpotDirective)
	;

	function TimeSpotDirective(){
		return {
			restrict: 'E',
			require: '^timeline',
			templateUrl: 'common/directives/widgets/timespot.html',
			replace: true,
			scope: {
				spot: '=',
				isVirtual: '='
			},
			link: function(scope, elm, attrs, timeLineCtrl){

				var haltPropagation = function(event){
					event && event.preventDefault();
					event && event.stopPropagation();
				};

				elm.on('mousedown', haltPropagation);

				var startPos, moved, init, hasMoved;

				angular.extend(scope, {
					startDrag: function($event, item){
						$event.preventDefault();

						hasMoved = false;

						if(!item) return;
						if(scope.spot.locked) return;

						if($event.type=='mousedown'){
							$(document).on('mousemove', scope._move);
							$(document).on('mouseup', scope._endDrag);
							startPos = $event.pageX;
						} else if ($event.type === 'touchstart') {
							$(document).on('touchmove', scope._move);
							$(document).on('touchend', scope._endDrag);
							startPos = $event.touches[0].pageX;
						}
						moved = item;
						init = scope.spot[moved + 'OffsetX'];
					},
					move: function($event){

						window.getSelection().removeAllRanges();

						var evt = $event.originalEvent || $event,
							px = evt.pageX || evt.screenX || evt.touches && evt.touches[0].pageX || 0,
							diff = (px - startPos) / timeLineCtrl.getWidth() * 100 + init;

						if(diff < 0) diff = 0;
						if(diff > 100) diff = 100;

						$event.preventDefault();

						scope.spot[moved + 'OffsetX'] = diff;

						if(scope.spot.startOffsetX > scope.spot.endOffsetX)
							if(moved === 'end')
								scope.spot.startOffsetX = scope.spot.endOffsetX;
							else
								scope.spot.endOffsetX = scope.spot.startOffsetX;

						timeLineCtrl.actualization(scope.spot);
						hasMoved = true;
						scope.$evalAsync();
					},
					endDrag: function(event){
						$(document).off('mousemove', scope._move);
						$(document).off('mouseup', scope._endDrag);
						$(document).off('touchmove', scope._move);
						$(document).off('touchebd', scope._endDrag);
						if(scope.spot.startOffsetX >= scope.spot.endOffsetX){
							delete scope.spot.endOffsetX;
							delete scope.spot.endDate;
						}
						if(hasMoved){
							timeLineCtrl.spotChanged(scope.spot);
						}
						scope.$evalAsync();
					}
				});


				scope._move = scope.move.bind(scope);
				scope._endDrag = scope.endDrag.bind(scope);
			}
		}
	}
})();
