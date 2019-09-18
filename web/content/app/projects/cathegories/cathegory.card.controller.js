(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('CathegoryCardController', CathegoryCardController)
	;

	function CathegoryCardController($scope, CathegoriesService, alert){
		angular.extend($scope, {
			save: function(){
				$scope.cathegory && $scope.cathegory.save().then(function(newCath){
					alert({
						isMessage: true,
						message: "Категория создана"
					});
					$scope.onSave && $scope.onSave(newCath);
					$scope.$close();
				})
			}
		});
	}
})();
