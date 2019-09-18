(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjFileIcon', ProjectorFileIconDirective);

	function ProjectorFileIconDirective(){
		return {
			restrict: 'E',
			scope: {
				fileInfo: '='
			},
			templateUrl: 'common/directives/ui/projector-file-icon.html',
			link: function(scope, elem, attr){
				scope.icon = "avi";
			}
		}
	}
})();
