(function(){
	'use strict';
	angular.module('projector.services')
		.service('DocumentsService', DocumentsService)
	;

	function DocumentsService(AbstractOwnerService, Restangular){
		var serv = function(owner){
			var docService = AbstractOwnerService(owner).service("documents")
			return {
				getList: function(options){
					return docService.getList(options).then(function(list){
						/*list.forEach(function(doc){
							doc._file && AbstractOwnerService.prepareFilePreview(doc._file);
						});*/
						return list;
					});
				},
				createDocument: function(item){					
					if(item instanceof File){
						item = angular.extend({}, {
							title: item.name,
							metadata: {
								size: item.size,
								type: item.type,
								lastModified: item.lastModified,
							}
						});
					} else {
						item = angular.extend(item || {}, { metadata: {type: 'base64/html'} });
					}
					var res = docService.one();
					angular.extend(res, item);
					return res;
				},
				getDocument: function(docId){
					return docService.one(docId).get();
				}
			}
		};

		angular.extend(serv, {
			getDocumentFilePreview: function(item){
				if(item._file && item._file._preview){
					var fileres = Restangular.service("file");
					return fileres.one(item._file._id).get({transcoded: true});
				}
			}
		})
		return serv;
	}

})();
