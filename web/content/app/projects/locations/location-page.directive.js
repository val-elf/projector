(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjLocationPage', ProjectorLocationPage)
		.controller('ProjectorLocationPageController', ProjectorLocationPageController)
	;

	function ProjectorLocationPage(LocationsService, $state, LocationTypesUtils){
		return {
			restrict: 'E',
			templateUrl: 'projects/locations/location.page.html',
			controller: 'ProjectorLocationPageController',
			controllerAs: 'locationPageCtrl',
			scope: {
				item: '='
			},
			link: function(scope, elem, attr, ctrl){
				ctrl.item = scope.item;
				ctrl._is_inherited = LocationTypesUtils.isInherited(ctrl.item.locationType);
				var locService = new LocationsService(scope.$parent.project);
				if(ctrl._is_inherited){					
					locService.getList({
						exclude: [scope.item._id],
						orderByType: LocationTypesUtils.values
					}).then(function(locations){
						scope.locations = locations.filter(function(loc){
							return ctrl._is_inherited.indexOf(loc.locationType) > -1;
						})
					});
				}
				//if(!ctrl.item.map) ctrl.item.map = [];
			}
		}
	}

	function ProjectorLocationPageController($scope, LocationTypesUtils) {
		var vm = this;
		angular.extend(this, {
			_is_inherited: false,
			isInherited: function(){
				return this._is_inherited;
			},
			createNewMap: function(){
				this.item.map = [];
			},
			prepareLocation: function(file, result){
				this.item.map.push({
					image: {
						_file: result._id,
						width: file.data.width,
						height: file.data.height,
						zoom: 1,
						x: 0,
						y: 0						
					}
				});
				app.showLoader(true);
				this.item.save().then(ritem=>{
					app.showLoader(false);
					$scope.$broadcast("mapUpdate");
					$scope.$evalAsync();
				});
			},
			changeNeighborsShow: function(){
				this.mapEditor && this.mapEditor.showNeighbors(this.neighbors);
			},
			setUploader: (function(uploader){
				this.uploader = uploader;
			}).bind(vm),
			removeParentMap: function(){
				this.item.parent.scale = null;
				this.item.parent._location = null;
				app.showLoader(true);
				this.item.save().then(ritem => {
					app.showLoader(false);
				});
			},
			changingLocation: function(){
				this.item.parent.scale = 1;
			},
			changeParentScale: function() {
				$scope.$evalAsync();
			},
			save: function(){
				app.showLoader(true);
				if(this.uploader && this.uploader.containsFileToUpload){
					this.uploader.upload();
				} else {
					this.item.map = this.item.map && this.item.map.filter(item=>{
						return item.image || item.shape && item.shape.length;
					}) || [];

					this.item.save().then(function(){
						app.showLoader(false);
						$scope.$evalAsync();
					})
				}
			}
		})
	}
})();
