(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjPreviewUploader', ProjectorPreviewUploaderDirective)
	;

	function ProjectorPreviewUploaderDirective(){
		return {
			restrict: 'E',
			scope: {
				item: '='
			},
			templateUrl: 'common/directives/ui/projector-preview-uploader.html',
			link: function(scope, elem, attr){
				if(scope.item && scope.item.preview) scope.preview = {
					data: scope.item.preview
				};
				scope._preview = {};

				scope.$watch("_preview", function(data){
					if(data.data) scope.item.preview = data.data;
				});
			}
		}
	}
})();
