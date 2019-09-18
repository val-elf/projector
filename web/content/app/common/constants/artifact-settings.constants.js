(function(){
	'use strict';

	angular.module('projector.constants')
		.constant('ArtifactTypes', {
			'item': 'предмет',
			'toponym' : 'топоним',
			'name': 'наименование',
			'phenomenon': 'явление',
			'notion': 'понятие'
		})
		.filter('artifactTypeLocalize', function(ArtifactTypes){
			return function(value){
				return ArtifactTypes[value]
			}
		})
	;
})();
