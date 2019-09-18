(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('projectForm', [function () {
			return {
				restrict: 'E',
				scope: {
					project: '=?',
					saveReg: '=',
					mode: '@'
				},		
				templateUrl: 'projects/project-card.html',
				controller: "ProjectFormController as projectCtrl"
			};
		}])
		.controller("ProjectFormController", ProjectFormController)
	;

	function ProjectFormController($scope, ProjectsService){

		angular.extend($scope, {
			isDisabled: function(){
				return !this.projectForm.$valid;
			}
		});

		var vm = this;

		vm.filePreview = {};

		if(!$scope.mode)
			$scope.mode = 'edit';

		$scope.$watch("project",
			function(){ //create a project shadow
				if(!$scope.project) $scope.project = ProjectsService.create();
				$scope._wc_project = angular.copy($scope.project);
				vm.filePreview = {
					data: $scope._wc_project.preview
				};
			}
		);

		function save(){
			angular.extend($scope.project, $scope._wc_project);
			$scope.project.preview = angular.extend({}, vm.filePreview.data);

			$scope.project.save().then(function(project){
				angular.extend($scope.project, project.plain());
				ProjectsService.refresh(true);
				$scope.$parent.$close();
			});
		}

		$scope.saveReg && $scope.saveReg(save);
	}
}());