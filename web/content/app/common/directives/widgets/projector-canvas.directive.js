(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjCanvas', ProjectorCanvasDirective)
		.controller('ProjectorLocationMapController', ProjectorLocationMapController)
	;

	function ProjectorCanvasDirective(){
		return {
			restrict: 'E',
			scope: {

			},
			templateUrl: 'common/directives/widgets/projector-canvas.html',
			controller: 'ProjectorLocationMapController',
			controllerAs: 'canvasCtrl',
			link: function(scope, elem, attrs, own){
				elem = $(elem[0]);
				var canvas = elem.find("canvas")[0]; 
				canvas.width = elem.width();
				canvas.height = elem.height();
				var ctx = canvas.getContext("2d");
				ctx.lineJoin = "round";
				ctx.lineWidth = 0.1;
				ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
				ctx.fillStyle = "rgba(0,0,0,0.5)";
				var pt;
				var brush_width = 3;
				elem[0].tabIndex = 0;
				elem.on('keydown', function(event){
					if(event.keyCode === 69){
						ctx.fillStyle="rgba(0, 0, 0, 1)";
						ctx.strokeStyle = "rgba(0, 0, 0, 1)";
						ctx.globalCompositeOperation = "destination-out";
					}
				});
				angular.extend(scope, {
					processDraw: function(event){
						//console.log("evt", event);
						return;
						if(!pt){
							ctx.beginPath();
							ctx.moveTo(event.layerX, event.layerY);
							//ctx.lineTo(event.layerX, event.layerY);
						} else {
							ctx.lineTo(event.layerX, event.layerY);
							ctx.stroke();
							pt = null;
						}
						pt = {
							x: event.layerX,
							y: event.layerY
						};
					},
					startFlow: function(event){
						this.flow = true;
						//ctx.moveTo(event.layerX, event.layerY);
					},
					endFlow: function(event){
						this.flow = false;
						pt = null;
						//ctx.stroke();
					},
					dist: function(p1, p2){
						var dx = p1.x - p2.x, dy = p1.y - p2.y;
						return Math.sqrt(dx * dx + dy * dy);
					},
					flowDraw: function(event){
						if(this.flow){
							ctx.beginPath();
							var npt = {
								x: event.layerX, 
								y: event.layerY
							};
							var dst = pt && this.dist(pt, npt) || null;
							if(dst > brush_width / 2){
								ctx.moveTo(pt.x, pt.y);
								ctx.lineTo(npt.x, npt.y);
								var ow = ctx.lineWidth;
								ctx.lineWidth = brush_width;
								ctx.stroke();
								ctx.lineWidth = ow;
							} else {
								ctx.arc(npt.x, npt.y, brush_width / 2, 0, 2*Math.PI);
								ctx.fill();
							}
							pt = {
								x: event.layerX,
								y: event.layerY
							};
							//ctx.beginPath();
							ctx.moveTo(event.layerX, event.layerY);
						}
					}
				});
			}
		}
	}

	function ProjectorLocationMapController($scope){

	}
})();

