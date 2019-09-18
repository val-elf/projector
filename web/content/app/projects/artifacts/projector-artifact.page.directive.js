(function(){
	'use strict';
	angular.module('projector.directives')
		.directive('pjArtifactPage', ProjectorArtifactPage)
	;

	function ProjectorArtifactPage(){
		return {
			restrict: 'E',
			templateUrl: 'projects/artifacts/projector-artifact.page.html',
			controller: function(){
				angular.extend(this, {
					editorOptions: {},
					save: function(){
						app.showLoader(true);
						this.item.save().then(()=>{
							app.showLoader(false);
						})
					},

					toFullScreen: function(){
						this.editorOptions.editorInstance.setToFullScreen();
					}
				});
			},
			controllerAs: 'pjArtifactPageCtrl',
			scope: {
				item: '='
			},
			link: function(scope, elem, attr, ctrl){
				ctrl.item = scope.item;
			}
		};
	}
})();
