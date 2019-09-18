(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('CharacterCardController', CharacterCardController)
	;

	function CharacterCardController($scope, CharactersService, CharacterTypes, alert){
		var charService = CharactersService($scope.project),
			vm = this;
		if(!$scope.character) $scope.character = charService.create();
		$scope.item = $scope.character.plain();
		$scope.chartypes = CharacterTypes;


		$scope.save = function(){
			angular.extend($scope.character, $scope.item);

			$scope.character.save().then(function(item){
				angular.extend($scope.character, item.plain());				
				charService.getList();
				$scope.$close();
			}, function(err){
				alert({
					message: 'Ошибка',
					isMessage: true,
					error: err
				});
			});


			$scope.$on('changeTab', function(tab){
				
			})
		}
	}
})();

