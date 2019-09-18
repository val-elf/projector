(function(){
	'use strict';

	angular.module('projector')
		.config(function($stateProvider){
			$stateProvider
				.state('app.dashboard', {
					url: '',
					templateUrl: 'dashboard/dashboard.html',
					controller: 'DashboardController as dashboardCtrl'
				})
		})
		.controller('DashboardController', DashboardController)
	;

	function DashboardController($scope, $rootScope, modal, ProjectsService) {
		$scope.projectsList = [];

		ProjectsService.onRefresh(function(){
			ProjectsService.getList({count: 30}).then(function(projects){
				$scope.projectsList = projects;
			});
		});

		ProjectsService.refresh();

		angular.extend($scope, {
			newProject: function(){
				modal.open({
					templateUrl: 'projects/modals/new-project.html'
				})
			}
		});

	}

}());
