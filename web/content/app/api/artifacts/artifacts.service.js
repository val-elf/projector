(function(){
	'use strict';

	angular.module('projector.services')
		.service('ProjectorArtifactsService', ProjectorArtifactsService)
	;

	function ProjectorArtifactsService(Restangular){

		return function(project){
			var owner = Restangular.service('artifacts', project);
			return {
				getList: function(pager){
					return owner.getList(pager);
				},

				getArtifact: function(artifactId) {
					return owner.one(artifactId).get();
				},

				create: function(){
					return owner.one();
				},

				onRefresh: null,
				pager: {},

				refresh: function(){
					var vm = this;
					this.getList(this.pager).then(function(list){
						vm.onRefresh && vm.onRefresh(list);
					})
				}
			}
		}
	}
})();
