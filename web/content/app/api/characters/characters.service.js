(function(){
	'use strict';

	angular.module('projector.api')
		.service('CharactersService', CharactersService)
	;

	function CharactersService(Restangular){
		var res = function(project){
			var characters = Restangular.service('characters', project);

			return {
				getList: function(params) {
					return characters.getList(params);
				},
				getCharactersCount: function(){
					return characters.one('count').get();
				},
				get: function(characterId){
					return characters.one(characterId).get();
				},
				create: function(){
					return characters.one();
				},

				onRefresh: null,

				refresh: function(){
					var vm = this;
					this.getList().then(function(list){
						vm.onRefresh && vm.onRefresh(list);
					});
				}
			};
		}

		angular.extend(res, {
			get: function(projectId, characterId){
				return Restangular.service("characters", Restangular.one("projects", projectId)).one(characterId).get();
			}
		});

		return res;
	}

})();
