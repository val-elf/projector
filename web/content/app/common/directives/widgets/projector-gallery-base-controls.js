(function(){
	'use strict';
	angular.module('projector.directives')
		.directive('pjGalleryBaseControls', ProjectorGalleryBaseControls)
	;

	function ProjectorGalleryBaseControls(){
		return {
			restrict: 'E',
			scope: {
				galleryCtrl: '='
			},
			replace: true,
			templateUrl: 'common/directives/widgets/projector-gallery-controls.html',
			link: function(scope, elem, attrs){
				scope.galleryCtrl = scope.galleryCtrl || scope.$parent.galleryCtrl;
			}
		}
	}
})();
