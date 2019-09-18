(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('TimespotCardController', TimespotCardController)
	;

	function TimespotCardController($scope, TimespotsService, TimelinesService){
		var tsService = TimespotsService($scope.timeline);
		if(!$scope.spot) $scope.spot = TimespotsService.create();

		$scope.wc = angular.copy($scope.spot);

		$scope.changeStartDate = function(){
			TimelinesService.actualizationTimespot($scope.timeline, $scope.wc, 'startDate');
		};

		$scope.changeEndDate = function(){
			TimelinesService.actualizationTimespot($scope.timeline, $scope.wc, 'endDate');
		};

		$scope.changeStartOffset = function(){
			TimelinesService.actualizationTimespot($scope.timeline, $scope.wc, 'startOffset');
		};

		$scope.changeEndOffset = function(){
			TimelinesService.actualizationTimespot($scope.timeline, $scope.wc, 'endOffset');
		};

		$scope.save = function(){
			angular.extend($scope.spot, $scope.wc)
			return $scope.spot.save().then(function(res){
				$scope.spot = res;
				$scope.$close();
			});
		}
	}
})();
