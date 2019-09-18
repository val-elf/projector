(function(){
	'use strict';

	angular.module('projector.projects')
		.controller('ProjectsListController', ProjectsListController)
	;

	function ProjectsListController($scope, modal, ProjectsService){
		var pager = {
				offset: 0,
				count: 10,
				dir: 'desc'
			},
			meta = {
				more: true,
				dt: Math.round(Math.random() * 100000)
			}
		;

		$scope.meta = meta;
		var readNow;
		ProjectsService.onRefresh(function(force){
			if(!force && readNow) return;
			if(force){
				angular.extend(pager, {
					offset: 0,
					count: 10
				});
				$scope.projects = [];
			}
			pager.sort = $scope.sort;
			readNow = true;
			return ProjectsService.getList(pager).then(function(projects){
				readNow = false;
				
				if(!$scope.projects)
					$scope.projects = projects;
				else
					$scope.projects = $scope.projects.concat(projects);

				meta = projects._;

				if(meta.more){
					pager.offset += pager.count;
					pager.count = app.config.infinityAdd;
				}
			});
		});

		angular.extend(this, {
			createNewProject: function() {
				modal.open({
					templateUrl: 'projects/modals/new-project.html'
				});
			}
		})

		angular.extend($scope, {
			readNext: function(){
				if(meta && meta.more){
					return ProjectsService.refresh();
				}
			},
			editProject: function(project){
				var sc = $scope.$new();
				sc.project = project;
				modal.open({
					templateUrl: 'projects/modals/project-form.html',
					scope: sc
				});
			},
			changeSort: function(){
				pager.offset = 0;
				pager.count = 10;
				meta.more = true;
				$scope.projects = [];
			}
		})
	}
}());