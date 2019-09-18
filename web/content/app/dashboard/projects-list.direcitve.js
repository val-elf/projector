
(function(){
	'use strict';
	angular.module('projector.directives')
		.directive('dashboardProjectsList', DashboardProjectsList);


	function DashboardProjectsList(){
		return {
			restrict: 'E',
			replace: true,
			template: ['<div class="list">',
					'<div class="item" ng-repeat="project in projectsList"><a href="/projects/{{project._id}}">{{project.name}}</a></div>',
				'</div>']
				.join('')
		}
	}
})();
