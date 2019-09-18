(function(){
	'use strict';

	angular.module('projector.services')
		.service('LocationsService', ProjectorLocationsService)
	;

	function ProjectorLocationsService(Restangular, $q){
		var services = {};
		return function(project, types){
			if(services[project._id]) return services[project._id];

			var owner = Restangular.service('locations', project),
				loadedList;
				
			Restangular.extendModel('locations', function(item){
				angular.extend(item, {
					getParentLocation: function() {
						if(!this.parent) return $q.when(null);
						if(loadedList){
							return $q.when(loadedList).then( (loclist) =>{
								return loclist.find( item => {
									return item._id === this.parent._location ? item : undefined;
								});
							} );
						}
						return owner.one(this.parent._location).get();
					},
					loadChildren: function(){
						if(loadedList){
							return $q.when(loadedList).then( loclist => {
								return loclist.filter( item => {
									return item.parent && item.parent._location === this._id;
								});
							});
						}
					}
				})
				return item;
			})

			var res = {
				onRefresh: null,
				pager: {
					orderByType: types
				},

				getList: function(pager){
					loadedList = owner.getList(pager || this.pager || undefined).then( (list) =>{
						loadedList = list;
						return list;
					});
					return loadedList;
				},

				create: function(){
					return owner.one();
				},

				getItem: function(locationId){
					return owner.one(locationId).get();
				},

				refresh: function(){
					var vm = this;
					this.getList(this.pager).then(function(list){
						vm.onRefresh && vm.onRefresh(list);
					})
				}
			}
			services[project._id] = res;
			return res;
		}
	}
})();
