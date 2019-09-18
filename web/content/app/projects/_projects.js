(function(){
	'use strict';

	angular.module('projector.projects', [])
		.config(['$stateProvider', function($stateProvider){
			$stateProvider
				.state('app.projects', {
					url: 'projects',
					templateUrl: 'projects/projects-list.html',
					controller: 'ProjectsListController as projectsCtrl'
				})
				.state('app.projects-item', {
					url: 'projects/:projectId',
					templateUrl: 'projects/project-view.html',
					controller: 'ProjectViewController as projectCtrl',
					resolve:{
						projectId: ['$stateParams', function($stateParams){
							return $stateParams.projectId;
						}],
						project: ['$stateParams', 'ProjectsService', function($stateParams, ProjectsService){
							return ProjectsService.getProject($stateParams.projectId);
						}]
				   }
				})
				.state('app.projects-inner', {
					url: 'projects/:projectId',
					templateUrl: 'projects/project-innerView.html',
					controller: 'ProjectViewController as projectCtrl',
					resolve: {
						projectId: ['$stateParams', function($stateParams){
							return $stateParams.projectId;
						}],
						project: ['$stateParams', 'ProjectsService', function($stateParams, ProjectsService){
							return ProjectsService.getProject($stateParams.projectId);
						}]
					}
				})
		}]);
}());
