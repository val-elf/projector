(function(){
	'use strict';

	angular.module('projector.filters')
		.filter('sanitize', function($sce){
			return function(value){
				return $sce.trustAsHtml(value);
			}
		})
	;
})();
