(function(){
	'use strict';
	angular.module('projector.api')
		.service('ProjectsService', ProjectsService )
	;

	function ProjectsService(Restangular){
		var sprojects = Restangular.service("projects"), rcallback;

		return {
			getList: function(paging){
				return sprojects.getList(paging);
			},
			getProject: function(projectId){
				return sprojects.one(projectId).get();
			},
			onRefresh: function(callback){
				rcallback = callback;
			},
			refresh: function(force){
				rcallback && rcallback(force);
			},
			create: function(){
				return sprojects.one();
			}
		}
	}
}());