(function(){
	'use strict';

	angular.module('projector.constants')
		.constant('CharacterTypes', {
				'protagonist': {
					name: 'Главный герой'
				},
				'first-plan': {					
					name: 'Герой первого плана'
				},
				'second-plan': {
					name: 'Герой второго плана'
				},
				'secondary': {
					name: 'Второстепенный персонаж'
				}
			}
		)
		.filter('characterTypeLocalize', function(CharacterTypes){
			return function(value){
				return CharacterTypes[value].name
			}
		})			
	;

})();
