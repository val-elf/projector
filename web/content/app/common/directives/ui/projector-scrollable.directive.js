(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjScrollable', ProjectorScrollableDirective)
	;

	function ProjectorScrollableDirective(){
		return {
			restrict: 'A',
			scope: {
				maxHeight: '@',
				minHeight: '@',
				orientation: '@',
				onReachEnd: '&',
			},
			transclude: true,
			templateUrl: 'common/directives/ui/projector-scrollable.html',
			require: 'pjScrollable',
			controllerAs: "ctrl",
			controller: function(){
				this.endpoint = 0;
				this.markerDrag = false;
				this.markerPos = 0;
				this.cpos = 0;

				this.getCurrentPos = function(){
					return Math.round(this.cpos);
				}
			},
			link: function(scope, elem, attrs, vm) {
				scope.orientation = scope.orientation || 'vertical';
				var elem = $(elem[0]),
					cont = elem.find(".scrollable"),
					slider = elem.find(".slider"),
					marker = elem.find(".scroll-marker"),
					mtd = scope.orientation === 'vertical' ? 'height' : 'width',
					operated = scope.orientation === 'vertical' && 'top' || 'left',
					axis = scope.orientation === 'vertical' && 'Y' || 'X',
					sdim, //slider dimension
					cdim, //container window dimension
					mdim, //marker dimension
					mover,
					markerAnchor = 0,
					markerPos = 0,
					passedEdge = false				
				;

				var speed = 0,
					friction = 0,
					flightOut = 150,
					outside = false,
					frictionFactor = function(offset, snorm){
						if(offset !== undefined){
							offset = Math.abs(offset);
							return offset < 35 ? -0.25 :
									offset < 55 ? -0.27 : 
									offset < 100 ? -0.32 :
									offset < flightOut ? -0.7 : -0.9;
						}
						return -0.05;
					},
					elasticFactor = function(offset, snorm){
						var anorm = sign(offset * snorm);
						offset = Math.abs(offset);
						if(anorm < 0){
							return offset < 55 ? -0.02 : 
								offset < 70 ? -0.02 : 
								offset < 85 ? -0.03 :
								offset < 90 ? -0.05 : 
								offset < flightOut ? -0.06 : -0.1
							;
						} else {							
							return offset < 35 ? -0.02 : 
								offset < 40 ? -0.03 : 
								offset < 65 ? -0.05 :
								offset < 70 ? -0.09 : 
								offset < flightOut ? -0.13 : -0.2
							;
						}
					}
				;

				vm.slider = slider;
				vm.operated = operated;

				marker.on('mousedown', startDragMarker);
				slider.on('touchstart', startDragSlider);

				/*$(document).on('keydown', function(evt){
					if(evt.keyCode === 40){
						addSpeed(-240, 1000);
						evt.preventDefault();
					} else if(evt.keyCode === 38) {
						addSpeed(240, 1000);
						evt.preventDefault();
					}
				})*/
				var debounceRun;
				scope.$watch(function(){
					return slider[mtd]()
				}, function(ht){
					var dbnc = function(){
						sdim = ht;
						if(!scope.maxHeight){
							cdim = ht;
						} else {
							if(ht > scope.maxHeight) ht = scope.maxHeight;
							if(ht === cont[mtd]()) return;

							cont[mtd](ht);
							cdim = ht;
						}

						vm.topPos = cdim - sdim;
						vm.nonmovable = cdim >= sdim;
						if(vm.nonmovable || vm.topPos > vm.cpos){
							vm.cpos = 0;
							speed = 0;
							setPosition(0, true);
						}

						mdim = Math.round(cdim / sdim * cdim);
						if(mdim < 40) mdim = 40;
						var mloc = {};
						mloc[mtd] = mdim;
						marker.css(mloc);
						debounceRun = null;
					}
					if(debounceRun) clearTimeout(debounceRun);
					debounceRun = setTimeout(dbnc, 300);

				});
				cont.on('wheel', function(evt){
					var evt = evt && evt.originalEvent || evt;
					if(vm.nonmovable) return;
					evt.preventDefault();
					addSpeed(evt['wheelDelta' + axis] * 2, 1000);
				});

				function startDragSlider(evt){
					vm.sliderDrag = true;
					slider.on('touchend', stopDragSlider);
					slider.on('touchmove', dragSlider);
					vm.inMove = true;
					evt = evt.originalEvent || evt;
					vm.speed = [];
					vm.sliderPos = evt.touches[0]['page' + axis];
					vm.sliderTime = new Date().getTime();
				}

				function dragSlider(evt){
					evt = evt.originalEvent || evt;
					evt.preventDefault();
					var npos = evt.touches[0]['page' + axis],
						delta = npos - vm.sliderPos
					;
					vm.sliderPos = npos;
					var dt = new Date().getTime();

					vm.speed.unshift({delta: delta, time: dt - vm.sliderTime});
					vm.sliderTime = dt;
					setPosition(vm.cpos + delta, true);
				}

				function stopDragSlider(evt){
					vm.inMove = false;
					evt = evt.originalEvent || evt;
					var lastDelta = vm.endpoint;
					var speed = vm.speed.slice(0, 5).reduce(function(res, value){res.delta += value.delta; res.time += value.time; return res;}, {delta: 0, time: 0}),
						rspeed = speed.delta / speed.time * 250;
					Math.abs(rspeed) > 50 && addSpeed(rspeed, 13000);
					clearInterval(vm.speedDowner);
					slider.off('touchend', stopDragSlider);
					slider.off('touchmove', dragSlider);
				}

				function startDragMarker(evt){
					evt.preventDefault();
					vm.markerDrag = true;
					$(document).on('mousemove', dragMarker);
					$(document).on('mouseup', stopDragMarker);
					markerAnchor = evt['page' + axis];
					markerPos = vm.markerPos;
				}

				function dragMarker(evt){
					evt.preventDefault();
					var delta = evt['page' + axis] - markerAnchor;

					if(markerPos + delta < 0) delta = -markerPos;
					if(markerPos + delta + mdim > cdim) delta = cdim - mdim - markerPos;

					vm.markerPos = markerPos + delta;

					var spos = vm.markerPos / (cdim - mdim) * (cdim - sdim);
					setPosition(spos);
					scope.$evalAsync();
				}

				function stopDragMarker(evt){
					evt.preventDefault();
					evt.stopPropagation();
					$(document).off('mousemove', dragMarker);
					$(document).off('mouseup', stopDragMarker);
					vm.markerDrag = false;
				}

				function startMove(){
					if(!mover) mover = setInterval(moveSlider, 10);
				}

				function stopMove(){
					clearInterval(mover);
					speed = 0;
					friction = 0;
					mover = null;
				}

				function sign(x){
					return x > 0 ? 1: x < 0 ? -1 : 0;
				}

				function moveSlider(){
					var loc = {},
						offset,
						elastic = 0
					;
					outside = vm.cpos > 0 || vm.cpos < vm.topPos;
					if(outside){
						if(!passedEdge){							
							passedEdge = true;
							scope.onReachEnd({side: vm.cpos > 0 ? 'top' : 'bottom'});
						}
						offset = vm.cpos > 0 ? vm.cpos + speed: vm.cpos - vm.topPos + speed;
						if(vm.cpos > 0 && offset >= flightOut || vm.cpos < vm.topPos && offset <= -flightOut){
							vm.cpos = vm.cpos > 0 ? flightOut : vm.topPos - flightOut;
							offset = vm.cpos > 0 ? flightOut : -flightOut;
							speed = vm.cpos > 0 ? -0.0001 : 0.0001;
						}
						elastic = offset * elasticFactor(offset, sign(speed));
						//console.log("offset", vm.cpos, speed);
					} else {
						if(passedEdge) passedEdge = false;
					}
					//console.log("FR sp=%s, offset=%s, friction=%s, elas=%s, ff=%s, ef=%s", speed, offset, friction, elastic, frictionFactor(offset, sign(speed)), elasticFactor(offset, sign(speed)));
					//console.log("Force", speed, vm.cpos, friction + elastic, offset);

					if(isNaN(speed) || (!outside && Math.round(speed / 2) === 0)){
						stopMove();
						return;
					}
					vm.cpos += speed;
					speed = speed + friction + elastic;
					speed = Math.round(speed * 100) / 100;
					friction = speed * frictionFactor(offset, sign(speed));

					//console.log("------------------------pos %s----------speed %s----------------------",vm.cpos, speed);
					//limitations, check outside state
					loc[operated] = Math.round(vm.cpos) + 'px';
					if(!vm.markerDrag) vm.markerPos = (vm.cpos / vm.topPos) * (cdim - mdim);
					slider.css(loc);
					scope.$evalAsync();
				}

				function addSpeed(svector, time){
					//this is 'add speed function'
					if(vm.nonmovable) return;

					time = time || 3000;
					var cfriction = time / 100;
					if(!outside && speed * svector < 0) speed = speed / 5;
					else
						speed += 2 * svector / 29;

					friction = speed * frictionFactor();

					startMove();					
				}

				function setPosition(pos, force){
					if(!force && vm.nonmovable) return;

					var loc = {};
					loc[operated] = pos + 'px';
					vm.cpos = pos;
					outside = false;
					passedEdge = false;
					if(!vm.markerDrag) vm.markerPos = (pos / vm.topPos) * (cdim - mdim);
					speed = 0;
					slider.css(loc);
					scope.$evalAsync();
				}
			}
		}
	}

})();
