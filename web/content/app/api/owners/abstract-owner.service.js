(function(){
	'use strict';

	angular.module('projector.services')
		.service('AbstractOwnerService', AbstractOwnerService)
	;

	function AbstractOwnerService(Restangular){
		var res = function(owner){
			
			var ownService = Restangular.service("owner").one(owner._id);

			return {
				owner: owner,
				service: function(nested){
					return Restangular.service(nested, ownService);
				},
				getFiles: function(){
					return ownService.getList('files').then(function(files){
						//files.forEach(function(file){ res.prepareFilePreview(file);	});
						return files;
					});
				}
			}
		};

		res.prepareFilePreview = function(file){
			if(!file.preview){
				file.preview = {
					type: file.type || 'other'
				};
				if(file.type && file.type.match(/^image\//))
					file.preview.previewUrl = '/srv/file/' + file._id;
			}
		}

		return res;
	}
})();
