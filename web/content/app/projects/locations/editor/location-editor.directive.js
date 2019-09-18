(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjLocationEditor', ProjectorLocationEditorDirective)
	;

	function ProjectorLocationEditorDirective(LocationsService, ViewPort){
		return {
			restrict: 'E',
			templateUrl: 'projects/locations/editor/location-editor.html',
			scope: {
				location: '='
			},
			controller: 'ProjectorLocationEditorController',
			controllerAs: 'mapCtrl',
			require: ['^pjLocationPage','pjLocationEditor'],
			replace: true,
			link: function (scope, elem, attr, owns){
				elem = $(elem[0]);
				var own = owns[1],
					page = owns[0],
					container = elem.find(".map-window"),
					baseOffset,
					dnd = {},
					touchmode,
					scrdim,
					zoomPoint,
					location = scope.location;

				page.mapEditor = own;

				if(!location.scale) location.scale = 1;

				setTimeout(()=>	{
					baseOffset = elem.offset()
					container[0].focus();
				});

				container[0].tabIndex = 0;
				own.location = scope.location;

				scope.$watch("location.parent._location", function(_parent){
					_parent && scope.location.getParentLocation().then(parent => {
						scope.parent = angular.extend({},
							parent.plain(),
							{
								scale: location.parent.scale,
								position: location.parent.position || {x:0, y:0}
							}							
						);
						scope.location.parent.position = scope.parent.position;
						own.parent = scope.parent;

						scope.$watch("location.parent.scale", function(scale){
							own.parent.scale = parseFloat(scale);
						});
					});
				});

				own.container = container;

				function getZoomDim(offset, t1, t2, zPoint){
					var p1 = {x: t1.pageX - offset.left, y: t1.pageY - offset.top},
						p2 = {x: t2.pageX - offset.left, y: t2.pageY - offset.top},
						pc = { x: (p2.x + p1.x) / 2, y: (p2.y + p1.y) / 2 },
						dx = p1.x - p2.x, dy = p1.y - p2.y
					;
					angular.extend(pc, {
						deltaX: zPoint ? pc.x - zPoint.x : 0,
						deltaY: zPoint ? pc.y - zPoint.y : 0						
					});

					return {
						p1: p1,
						p2: p2,
						pc: pc,
						dist: Math.sqrt( dx * dx + dy * dy)
					};
				}


				container.on('wheel', function(event){
					//prepare coords
					event = event.originalEvent || event;
					var sign = event.wheelDeltaY > 0,
						zoom = 1.1,
						base = container.offset()
					;
					zoom = sign ? zoom : 1 / zoom;
					var x = event.pageX - base.left,
						y = event.pageY - base.top
					;
					own.moveZoom(x, y, zoom);
					event.preventDefault();
				});

				container.on('click', function(event){
					var sel = document.getSelection();
					if(sel.rangeCount)
						sel.getRangeAt(0).collapse(true);
					own.processPoint({x: event.offsetX, y: event.offsetY});
				});

				container.on('touchstart', event => {
					var evt = event.originalEvent || event,
						touches = evt.touches;

					if(touches.length === 1){ //pan mode
						touchmode = "touch";
						dnd = {
							x: touches[0].pageX - baseOffset.left,
							y: touches[0].pageY - baseOffset.top
						}
						own.startDrag(dnd.x, dnd.y, event);
						event.preventDefault();
					} else if(touches.length === 2){ //zoom mode
						var zoomInfo = getZoomDim(baseOffset, touches[0], touches[1]);
						zoomPoint = {
							x : (zoomInfo.p1.x + zoomInfo.p2.x) / 2,
							y : (zoomInfo.p1.y + zoomInfo.p2.y) / 2
						}
						scrdim = zoomInfo.dist;
						event.preventDefault();
						touchmode = "zoom";
					} else if( touches.length === 3){
					}					
				});

				container.on('touchmove', function(event){
					var evt = event.originalEvent || event,
						touches = evt.touches;
					if(evt.touches.length === 1) { //pan mode
						if(touchmode !== "pan"){
							dnd = {
								x: touches[0].pageX - baseOffset.left,
								y: touches[0].pageY - baseOffset.top
							}
							own.spaceDown();
							own.startDrag(dnd.x, dnd.y, event);
							touchmode = "pan";
						} else {
							movecontainer(touches[0]);
						}
					} else if(touchmode === "zoom" && evt.touches.length === 2){
						own.spaceRelease();
						var sc2 = getZoomDim(baseOffset, evt.touches[0], evt.touches[1], zoomPoint),
							zoom = sc2.dist / scrdim;
						zoomPoint = sc2.pc;
						scrdim = sc2.dist;
						own.applyZoom(zoom, zoomPoint);
					}
				});

				container.on('touchend', event => {
					var evt = event.originalEvent || event;
					if(touchmode === "pan"){
						own.spaceRelease();
					} else if( touchmode === "touch") {
						own.processPoint({
							x: dnd.x - baseOffset.left,
							y: dnd.y - baseOffset.top
						});
					}
					dnd = null;
					zoomPoint = null;
					if(evt.touches.length === 0) touchmode = null;
				});

				own.checkTouchMode = (mode) => { return touchmode === mode; };

				container.on('mousedown', event => {
					dnd = angular.extend({
						x: event.pageX - baseOffset.left,
						y: event.pageY - baseOffset.top
					});
					own.startDrag(dnd.x, dnd.y, event);
					$(document).on('mousemove', movecontainer);
					$(document).on('mouseup', stopcontainer);
				});

				var movecontainer = event =>{
					var rx = event.pageX - baseOffset.left,
						ry = event.pageY - baseOffset.top
					;
					own.drag(rx - dnd.x, ry - dnd.y, event);
					var sel = document.getSelection();
					if(sel.rangeCount)
						sel.getRangeAt(0).collapse(true);
				}

				var stopcontainer = event => {					
					own.stopDrag(event);
					$(document).off('mousemove', movecontainer);
					$(document).off('mouseup', movecontainer);
				}

				$(document).on('keydown', function(event){
					if(event.keyCode === 17 && own.mode !== 'parentMap'){ //ctrl key
						own.setParentMapMode(true);
					}
				});

				$(document).on('keyup', function(event){
					if(event.keyCode === 17 && own.mode === 'parentMap'){
						own.setParentMapMode(false);
					}
				})

				container.on('keyup', function(event){
					if(event.keyCode === 13) {
						event.preventDefault();
						own.enterPressing();
					} else if(event.keyCode === 32) {
						event.preventDefault();
						own.spaceRelease();
					} else if(event.keyCode === 67) {
						own.combineShapes();
					} //console.log("event", event.keyCode);
				});

				container.on('keydown', function(event){
					if(event.keyCode === 32){
						//stop drawing shape
						event.preventDefault();
						own.spaceDown();
					}
					else if(event.keyCode === 27){
						//cancel drawing                             
						event.preventDefault();
						own.cancelDrawing();
					} else if(event.keyCode === 46) {
						//delete selecteds shapes
						event.preventDefault();
						own.deleteSelectedShapes();
					}
				});

				own.init();
			}
		}
	}

})();
