(function(){
	'use strict';
	angular.module('projector.filters')
		.filter("fileSize", function(){
			var appendix = ['', 'K','M','G','T'];

			return function(value){
				var res = value, ind = 0;
				while( value > 1024 ){
					value /= 1024;
					ind ++;
				}
				return Math.round(value) + ' ' + appendix[ind] + 'b';
			}
		})
})();
