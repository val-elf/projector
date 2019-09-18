(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjLocationMap', ProjectorLocationMapDirective)
	;

	function ProjectorLocationMapDirective(){
		return {
			restrict: 'E',
			require: ['^pjLocationEditor', 'pjLocationMap'],
			templateUrl: 'app/projects/locations/editor/location-map.html',
			controller: 'ProjectorLocationMapController as pjLocationCtrl',
			replace: true,
			bindToController: true,
			scope: {
				item: '=',
				mapMode: '@'
			},
			link: function(scope, elem, attr, ctrls){
				elem = $(elem[0]).find(".map");
				var container = elem,
					item = scope.item,
					editor = ctrls[0],
					own = ctrls[1],
					paper
				;

				//for planet we should draw merchator's grid

				own.container = container;
				scope.item = own.item;

				function init(){
					var initfn = item => {
						if(!item) return;
						own.item = item;
						if(scope.item !== item) scope.item = item;
						if(own.mapMode === 'parent'){
							item.getViewPort = () => own.viewport;
							own.viewport.setViewPoint(item.scale, item.position);
							scope.$watch("item.scale", function(scale){
								if(scale){
									own.viewport.zoomFactor = scale;
									own.viewport.apply();
								}
							});
						}
						if(own.item.locationType === 'planet'){
							own.createMerchatorGrid();
						}
						scope.map = item.map;
						if(own.mapMode !== 'parent'){
							editor.setWorkingMap(own);
						}
						own.processMap();
					};

					editor.addMap(own);

					scope.$watch("item", initfn);

					own.editor = editor;
					container.mousemove(own.checkNearestShapes.bind(own));
				}

				setTimeout(function(){
					paper = Raphael(elem[0], "100%", "100%");
					own.setPaper(paper);
					init();
				});


			}
		}
	}

})();
