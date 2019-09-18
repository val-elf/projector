(function(){
	'use strict';

	angular.module('projector.files')
		.controller('FileController', ProjectoFileController)
	;

	function ProjectoFileController($scope, file){
		console.log("FL", file);
	}	

})();
