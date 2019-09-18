(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjArtifactForm', ProjectorArtifactFormDirective)
		.controller('ProjectorArtifactFormController', ProjectorArtifactFormController)
	;

	function ProjectorArtifactFormDirective(){
		return {
			restrict: 'E',
			scope: {
				item: '='
			},
			templateUrl: 'projects/artifacts/project-artifacts.form.html',
			controller: 'ProjectorArtifactFormController',
			controllerAs: 'artifactCtrl',
			require: 'pjArtifactForm',
			link: function(scope, elem, attr, own){
				own.item = scope.item.plain && scope.item.plain() || angular.extend({}, scope.item);
				angular.extend(scope.$parent, {
					isDisabled: function(){
						return !scope.artifactForm.$valid;
					},
					save: function(){
						if(!scope.artifactForm.$valid) return;
						angular.extend(scope.item, own.item);

						scope.item.save().then(function(nitem){
							angular.extend(scope.item, nitem.plain());
							own.item = nitem;
							scope.$parent.$close();
						})
					}
				})
			}
		}
	}

	function ProjectorArtifactFormController($scope, ArtifactTypes){
		this.artifactTypes = ArtifactTypes;
	}

})();
