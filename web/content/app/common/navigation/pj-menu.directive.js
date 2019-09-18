(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjMenu', function($location, $state, NavigationService){
			return {
				restrict: 'E',
				templateUrl: 'common/navigation/pj-menu.html',
				replace: true,
				controller: function($scope, $rootScope){
					NavigationService.get().then(function(nav){
						$scope.list = nav;
					})
					$scope.isActive = function(item){
						return $state.current.name.indexOf(item.state) === 0;
					}
					$scope.isSelected = function(item){
						return $state.current.name === item.state;
					}
				},
				controllerAs: 'menuCtrl'
			}
		})
})();