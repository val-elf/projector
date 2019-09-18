(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('TimelineCardController', TimelineCardController)
	;

	function TimelineCardController($scope, TimelinesService){
		var timelineService;
		timelineService = TimelinesService($scope.project);

		if(!$scope.timeline) $scope.timeline = timelineService.create();
		$scope.item = angular.copy($scope.timeline);

		angular.extend($scope, {
			save: function(){
				angular.extend($scope.timeline, $scope.item);

				$scope.timeline.save().then(function(timeline){
					$scope.timeline = timeline;
					timelineService.refresh();
					$scope.$close();
				});
			}
		})
	}
})();
