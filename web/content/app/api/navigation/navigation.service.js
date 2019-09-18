(function(){
	'use strict';
	angular.module('projector.services')
		.service('NavigationService', NavigationService)
	;

	function NavigationService(Restangular){
		var nserv = Restangular.service("navigation");

		return {
			get: function(){
				return nserv.getList();
			}
		}
	}
})();
