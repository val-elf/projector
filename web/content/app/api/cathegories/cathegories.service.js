(function(){
	'use strict';

	angular.module('projector.services')
		.service('CathegoriesService', CathegoriesService)
	;

	function CathegoriesService(Restangular){
		return function(owner){
			var ownService = Restangular.service("owner").one(owner._id);

			var rserv = Restangular.service("cathegories", ownService);
			return {
				createCathegory: function(parent){
					var res = rserv.one()
					if(parent) res._parent = parent._id;
					return res;
				},

				getCathegories: function(){
					var list = rserv.getList(), res = [];

					return list.then(function(rlist){
						/* transform to tree list */
						rlist.forEach(function(item){
							if(item._parent && item._parent !== item._owner) {
								var parent = rlist.find(function(_item){
									return _item._id == item._parent;
								});
								if(parent){
									if(!parent.children) parent.children = [];
									parent.children.push(item);
								}
							} else res.push(item);
						});
						return res;
					});
				},
				refresh: function(){
					return this.getCathegories().then((function(catList){
						this.onRefresh(catList);
					}).bind(this));
				},
				onRefresh: function(){}
			}
		}
	}
})();
