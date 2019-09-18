(function(){
	'use strict';

	angular.module('projector.projects')
		.config(function($stateProvider){
			$stateProvider
				.state('app.projects-item.tab', {
					url: '/:tabname',
					templateUrl: function($stateParams){
						return 'projects/tabs/project-' + $stateParams.tabname + '.html'
					},
					controller: "ProjectViewTabController as tabCtrl"
				})
				.state('app.projects-item.timeline', {
					url: '/timeline/:timelineId',
					templateUrl: 'projects/timelines/timelines-page.html',
					controller: "ProjectTimelineController as ctrl",
					resolve: {
						timeline: function(TimelinesService, project, $stateParams) {
							return TimelinesService(project).get($stateParams.timelineId);
						}
					}
				})
				.state('app.projects-inner.character', {
					url: '/chars/:characterId',
					templateUrl: 'projects/characters/character.page.html',
					controller: 'CharacterPageController',
					resolve: {
						character: ['CharactersService', 'ProjectsService', '$stateParams', function(CharacterService, ProjectsService, $stateParams){
							return CharacterService.get($stateParams.projectId, $stateParams.characterId);
						}]
					}
				})
				.state('app.projects-item.artifact', {
					url: '/artifacts/:itemId',
					templateUrl: function($stateParams){
						return 'projects/tabs/project-artifacts.html'
					},
					controller: 'ProjectViewTabController as tabCtrl'
				})
				.state('app.projects-item.location', {
					url: '/locations/:itemId',
					templateUrl: function($stateParams){
						return 'projects/tabs/project-locations.html'
					},
					controller: 'ProjectViewTabController as tabCtrl'
				})
			;
		})
		.controller('ProjectViewController', ProjectViewController)
		.controller('ProjectViewTabController', ProjectViewTabController)
	;

	function ProjectViewController($scope, $stateParams, $state, ProjectsService, modal, $location, project){
		var vm = this;
		$scope.project = project;

		function detectViewState(){
			vm.state = $state.current.name;
			switch($state.current.name){
				case 'app.projects-item.tab':
				case 'app.projects-item':
				case 'app.projects-item.location':
				case 'app.projects-item.artifact':
					vm.viewState = 'base';
					break;
				default:
					vm.viewState = 'special';
					var nm = $state.current.name;
					vm.viewName = nm.split('.')[2];
					break;						
			}
		}

		$scope.$on('$stateChangeSuccess', function(event, toState, params){
			detectViewState();
			$scope.setDashboardMode(true);
			$scope.setCurrentTabName(params.tabname);
		});

		vm.viewState = "base";
		detectViewState();

		angular.extend($scope, {
			dashboardMode: true,
			currentTabName: '',
			menu: [
				{
					title: 'Таймлайны',
					state: 'app.projects-item.tab',
					tabname: 'timelines',
					viewname: 'timeline'
				},
				{
					title: 'Документы',
					state: 'app.projects-item.tab',
					tabname: 'docs',
					viewname: 'document'
				},
				{
					title: 'Персонажи',
					state: 'app.projects-item.tab',
					tabname: 'chars',
					viewname: 'character'
				},
				{
					title: 'Артефакты',
					state: 'app.projects-item.tab',
					tabname: 'artifacts',
					viewname: 'artifact',
				},
				{
					title: 'Локации',
					state: 'app.projects-item.tab',
					tabname: 'locations',
					viewname: 'location'
				},
				{
					title: 'Задачи',
					state: 'app.projects-item.tab',
					tabname: 'tasks',
					viewname: 'task'
				}
			],
			setCurrentTabName: function(value){ $scope.currentTabName = value; },
			setDashboardMode: function(dashboardMode) {
				$scope.dashboardMode = dashboardMode; 
			},
			updateProjectName: function(){
				$scope.project.save();
			},
			processIconClick: function(){
				if($state.current.name === 'app.projects-item'){
					modal.open({
						templateUrl: 'projects/modals/project-form.html',
						params: {
							project: $scope.project
						}
					})
				}
				else
					$state.go('app.projects-item', {projectId: $scope.project._id});
			}
		});
	}

	function ProjectViewTabController($scope, $stateParams){
		$scope.setDashboardMode(true);
		$scope.setCurrentTabName($stateParams.tabname);
	};

}());
