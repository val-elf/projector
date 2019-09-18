(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjLocationForm', ProjectorLocationForm)
		.controller('ProjectorLocationFormController', ProjectorLocationFormController)
	;

	function ProjectorLocationForm(){
		return {
			restrict: 'E',
			templateUrl: 'projects/locations/locations.form.html',
			controller: 'ProjectorLocationFormController',
			controllerAs: 'locationCtrl',
			link: function(scope, elem, attr, own){
				scope.item = scope.location && scope.location.plain && scope.location.plain() || angular.extend({}, scope.location);
				own.item = scope.item;
				angular.extend(scope.$parent, {
					isDisabled: function(){
						return !scope.locationForm.$valid;
					},
					save: () => {
						angular.extend(scope.location, scope.item);

						scope.location.save().then(function(newItem){
							own.item = newItem;
							angular.extend(scope.item, newItem.plain());
							scope.$close();
						})
					}
				});


			}
		};
	}

	function ProjectorLocationFormController($scope, LocationTypes){
		angular.extend(this, {
			locationTypes: LocationTypes
		})
	}
})();
