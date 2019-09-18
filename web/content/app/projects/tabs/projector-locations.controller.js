(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('ProjectLocationsController', ProjectLocationsController)
	;

	function ProjectLocationsController($scope, modal, alert, $stateParams, LocationsService, LocationTypesUtils){
		var locService = LocationsService($scope.project, LocationTypesUtils.values),
			location;

		locService.onRefresh = locations =>{
			this.locations = locations;
		}


		if($stateParams.itemId){
			locService.getItem($stateParams.itemId).then(_location => this.location = _location);
			$scope.setCurrentTabName('locations');
		} else {
			locService.refresh();
		}

		angular.extend(this, {
			createLocation: function(){
				modal.open({
					templateUrl: 'projects/modals/location.card.html',
					params: {
						location: locService.create()
					}
				}).then(()=>{
					locService.refresh();
				});
			},
			editLocation: function(location){
				modal.open({
					templateUrl: 'projects/modals/location.card.html',
					params: {
						location: location
					}
				}).then(()=>{
					locService.refresh();
				})
			},
			deleteLocation: function(location) {
				alert({
					isConfirm: true,
					message: 'Вы уверены что хотите удалить локацию?'
				}).then(function(value){
					value && location.remove().then(()=>{
						locService.refresh();
					})
				})
			},
			save: function(){
				
			}
		})
	}
})();
