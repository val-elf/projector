(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('timeline', ProjectorTimeline)
		.controller('ProjectorTimelineController', ProjectorTimelineController);


	function ProjectorTimeline(){
		return {
			restrict: 'E',
			templateUrl: 'common/directives/widgets/timeline.html',
			controller: 'ProjectorTimelineController as timelineCtrl',
			scope: {
				timeline: '=',
				onSelectSpot: '&',
				onChangeSpot: '&'
			},
			replace: true,
			link: function(scope, elm, attrs){
				scope.showVirtual = false;

				scope.virtualSpot = {
					startOffsetX: 0,
					endOffsetX: 100,
					active: false
				}

				var virtual = $(elm[0].querySelector("div.timelinepoint-virtual")),
					timeline = elm[0].querySelector("div.timeline"),
					pos, rwidth, lastPos;


				scope.virtual = virtual;

				function getPointPosition(x){
					var lp = x < 0 ? 0 : x > rwidth ? rwidth : x;
					return lp;
				}

				elm.on('mouseenter', function(event){
					scope.showVirtual = true;
					scope.$evalAsync();
				});
				elm.on('mouseleave', function(){
					scope.showVirtual = false;
					scope.$evalAsync();
				});

				elm.on('mousemove', function(event){
					if(event.target != elm[0] && event.target != timeline){
						scope.showVirtual = false;
						scope.startPointPos = null;
						scope.$evalAsync();
						return;
					}
					if(!scope.showVirtual) scope.showVirtual = true;

					var lp = getPointPosition(event.layerX);
					lastPos = lp / rwidth;
					scope.virtDate = scope.getDateForPoint(lastPos);
					virtual.css({left: lp + 'px'});
					scope.$evalAsync();
				});

				var posShift = 0;
				angular.extend(scope, {
					redraw: function(){
						pos = $(elm).position(true);
						rwidth = $(elm).width();
						scope.rwidth = rwidth;
					},
					startSpot: function($event){
						this.startPointPos = null;
						if($event.button != 0) return;
						elm.addClass("drag-n-drop")

						this.startPointPos = $event.layerX;
						this.virtualSpot.active = true;
						this.virtualSpot.startOffsetX = this.startPointPos / rwidth * 100;
						this.virtualSpot.endOffsetX = this.virtualSpot.startPointPos;

						posShift = $(elm[0]).offset().left;
						$(document).on('mouseup', scope._endSpot);
						$(document).on('mousemove', scope._moveSpot);
					},
					moveSpot: function($event) {
						var lastPos;
						lastPos = ($event.pageX - posShift) / rwidth * 100;
						if(lastPos > 100) lastPos = 100;
						scope.virtualSpot.endOffsetX = lastPos;
						scope.$evalAsync();
						window.getSelection().removeAllRanges();
					},
					endSpot: function($event){
						elm.removeClass("drag-n-drop");
						$(document).off('mouseup', scope._endSpot);
						$(document).off('mousemove', scope._moveSpot);

						this.virtualSpot.active = false;

						var spx = this.virtualSpot.startOffsetX, epx = this.virtualSpot.endOffsetX;

						var points = [];
						if((epx - spx) / 100 * rwidth < 10){ //this is the same point
							points.push((spx + epx ) / 2);
						} else {
							points.push(spx);
							points.push(epx);
						}

						var	newSpot = scope.tsService.create(angular.extend(
							{
								startDate: scope.getDateForPoint(points[0]),
								startOffsetX:  points[0]
							}, points[1] ? {
								endDate: scope.getDateForPoint(points[1]),
								endOffsetX: points[1]
							} : {}
						));

						scope.spots.splice(scope.spots.length - 1, 0, newSpot);
						scope.selectCurrentSpot(null, newSpot);
						scope.$evalAsync();
					},
					selectCurrentSpot: function(event, spot){
						if(scope.current && scope.$spot === scope.current){
							scope.$spot = null;
							return;
						}
						scope.current = spot;
						scope.$spot = null;
						var res = scope.onSelectSpot(scope);
						if(!res)
							scope.current = null;
					},
					getDateForPoint: function(pos){
						if(!scope.timelength) return null;
						var timeshift = Math.round(scope.timelength * pos / 100),
						tm = new Date(scope.startPoint.getTime() + timeshift)
						return tm;
					}
				});

				scope._endSpot = scope.endSpot.bind(scope);
				scope._moveSpot = scope.moveSpot.bind(scope);

				scope.redraw();

			}
		}
	}

	function ProjectorTimelineController($scope, TimespotsService){
		var x = 0;

		$scope.$watch("timeline",
			function(timeline){
				if(!$scope.timeline) return;

				$scope.tsService = TimespotsService(timeline);


				$scope.spots = $scope.timeline.timespots;
				var spots = $scope.spots,
					startPoint = $scope.timeline.startDate,
					endPoint = $scope.timeline.endDate,
					timelength = endPoint && startPoint && (endPoint.getTime() - startPoint.getTime()) || NaN;

				$scope.startPoint = startPoint;				
				$scope.timelength = timelength;
				$scope.redraw();
			}
		);

		angular.extend(this, {
			getWidth: function(){
				return $scope.rwidth;
			},
			spotChanged: function(spot){
				$scope.$spot = spot;
				$scope.onChangeSpot($scope);
			},
			actualization: function(spot){
				spot.startDate = $scope.getDateForPoint(spot.startOffsetX);
				if(spot.endOffsetX) spot.endDate = $scope.getDateForPoint(spot.endOffsetX);
			}
		})
	}
})();