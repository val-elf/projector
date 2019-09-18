(function(){
	'use strict';

	angular.module('projector.constants')
		.constant('LocationTypes', {
			'celestial': 'небесное тело',
			'star': 'звезда',
			'satellite': 'спутник',
			'planet': 'планета',
			'mainland' : 'материк',
			'continent': 'континент',
			'georegion': 'географический регион',
			'state': 'государство',
			'area': 'область',
			'region': 'район',
			'city': 'город',
			'settlement': 'населенный пункт',
			'nature': 'природный объект'
		})
		.service('LocationTypesUtils', function(LocationTypes){
			return {
				isInherited: function(type){
					var inheriteds = {
						'mainland': ['planet', 'satellite'],
						'continent': ['planet', 'satellite', 'mainland'],
						'georegion': ['planet', 'satellite', 'mainland', 'continent'],
						'state': ['planet', 'satellite', 'mainland', 'continent', 'georegion'],
						'area': ['state', 'georegion', 'continent'],
						'region': ['state', 'area'],
						'city': ['state', 'area', 'region'],
						'settlement': ['state', 'area', 'region'],
						'nature': ['continent', 'georegion']
					}
					if(!inheriteds[type]) return false;
					return inheriteds[type];
				},
				values: Object.keys(LocationTypes)
			}
		})
		.filter('locationTypeLocalize', function(LocationTypes){
			return function(value){
				return LocationTypes[value]
			}
		})
	;
})();
