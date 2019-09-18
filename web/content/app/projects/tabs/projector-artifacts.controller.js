(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('ProjectorArtifactsController', ProjectorArtifactsController)
	;

	function ProjectorArtifactsController($scope, $stateParams, ProjectorArtifactsService, modal, alert, ArtifactTypes){

		var aservice = new ProjectorArtifactsService($scope.project),
			vm = this;

		aservice.onRefresh = list => vm.artifacts = list;

		if($stateParams.itemId){
			aservice.getArtifact($stateParams.itemId).then( artifact => this.artifact = artifact );
			$scope.setCurrentTabName('artifacts');
		} else {
			aservice.refresh();
		}


		angular.extend(this, {
			artifacts: null,

			createArtifact: function(){
				modal.open({
					templateUrl: 'projects/modals/artifact.card.html',
					params: {
						item: aservice.create()
					}
				}).then(function(){
					aservice.refresh();
				})
			},

			editArtifact: function(artifact){
				modal.open({
					templateUrl: 'projects/modals/artifact.card.html',
					params: {
						item: artifact
					}
				});
			},

			deleteArtifact: function(artifact){
				alert({
					isConfirm: true,
					message: 'Вы уверены что хотите удалить артефакт?'
				}).then(function(value){
					if(value){
						console.log("Try to del", artifact);
						artifact.remove().then(function(){
							aservice.refresh();
						})
					}
				})
			}
		})

	}
})();
