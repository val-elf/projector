(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('ProjectTimelinesController', ProjectTimelinesController)
	;


	function ProjectTimelinesController($scope, modal, TimelinesService, $stateParams){
		var ts;

		function refresh(){
			ts.getList().then(function(data){
				var dt = data.map(function(tl){
					var ntimeline = angular.copy(tl);
					return ntimeline;
				})
				$scope.timelines = dt;
			});
		}


		$scope.$watch("project", function(project){
			if(project){
				ts = TimelinesService(project);
				ts.onRefresh(refresh);
				refresh();
			}
		});

		angular.extend($scope, {
			createTimeLine: function(){
				modal.open({
					templateUrl: 'projects/timelines/timeline.card.html',
					params:{
						project: $scope.project
					},
					controller: 'TimelineCardController as ctrl'
				});
			}
		});
	};
})();
