(function(){
	'use strict';

	angular.module('projector.controllers')
		.controller('ProjectorCharactersController', ProjectorCharactersController);


	function ProjectorCharactersController($scope, modal, alert, CharactersService){
		var charService;
		charService = CharactersService($scope.project);

		charService.onRefresh = function(chars){ //refresh function
			$scope.characters = chars;
			$scope.$evalAsync();
		};

		charService.refresh();

		angular.extend(this, {
			createCharacter: function(){
				modal.open({
					templateUrl: 'projects/characters/character.card.html',
					controller: 'CharacterCardController',
					controllerAs: 'characterCtrl',
					params: {
						project: $scope.project
					}
				}).then(()=> charService.refresh());
			},
			editCharacter: function(char){
				modal.open({
					templateUrl: 'projects/characters/character.card.html',
					controller: 'CharacterCardController',
					controllerAs: 'characterCtrl',
					params: {
						character: char,
						project: $scope.project
					}
				});
			},

			deleteCharacter: function(char){
				alert({
					message: 'Вы уверены, что хотите удалить персонаж?',
					isConfirm: true
				}).then(function(value){
					if(value){
						char.remove().then(function(){
							charService.refresh();
						})
					}
				})
			}
		})

	};		
})();
