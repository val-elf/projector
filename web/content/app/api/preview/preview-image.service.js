(function(){
	'use strict';
	angular.module('projector.services')
		.service('PreviewImageService', PreviewImageService);


	function PreviewImageService(Restangular){
		var pserv = Restangular.service("imagePreview");
		return {
			getPreview: function(item){
				return pserv.one(item).save();
			}
		};
	}

})();
