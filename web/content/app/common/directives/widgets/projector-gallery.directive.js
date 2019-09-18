(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjGallery', ProjectorGalleryDirective)
		.directive('pjGalleryItem', ProjectorGalleryItemDirective)
		.directive('emptyBox', ProjectorGalleryEmptyBox)
	;


	function ProjectorGalleryDirective(){
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'common/directives/widgets/projector-gallery.html',
			scope: {
				type: '@'
			},
			controller: ProjectorGalleryController,
			transclude: true,
			link: function(scope, elem, attr){

				var core =  $(elem[0]), leftScroller, rightScroller, container, slider, roller,
					hwindow = 0,
					rollerpath = 0,
					maxposition = 0,
					cposition = 0,
					cwidth = 0,
					swidth = 0,
					houter,
					dragInfo = {
						start: null
					},
					shiftDeep = 30;
				if(!scope.type) scope.type = 'horizontal';

				/*if(scope.contoller){
					angular.extend(scope.controller, {
						selectAll: function(){

						}
					});
				}*/

				setTimeout(scope.type == 'horizontal'? initHorizontal : initBricks);

				function initHorizontal(){
					leftScroller = core.find('.scroller.leftside');
					rightScroller = core.find('.scroller.rightside');
					container = core.find('.content');
					slider = container.find('>.wrapper');
					roller = core.find(".hslider");
					hwindow = container.width() / 2;

					scope.container = container;

					slider[0].addEventListener("wheel", function(event){
						event.preventDefault();
						slider.addClass('pj-draggable');
						roller.addClass('pj-draggable');
						if(scope.setPosition(cposition - event.deltaY * 0.7)){
							dragInfo.speed = - event.deltaY * 0.3;
							slideDown();
						}
					})

					slider[0].addEventListener('mousedown', function(event){
						if(event.button !== 0) return;
						event.preventDefault();

						slider.addClass('pj-draggable');
						roller.addClass('pj-draggable');
						dragInfo.start = cposition;
						dragInfo.pos = event.x;
						slider[0].addEventListener('mousemove', mover);
						document.addEventListener('mouseup', movestop);
					});

					setTimeout(calcDimensions, 0);
				}

				function initBricks(){

				}

				function _setPos(){
					var opos = cposition;
					scope.setPosition(dragInfo.start - dragInfo.pos + event.x);
					dragInfo.speed = cposition - opos;					
				}

				function mover (event){
					if(dragInfo.start === null) return;
					dragInfo.isDrag = true;
					_setPos(event);
				}

				function movestop(event){
					dragInfo.distance = dragInfo.pos - event.x;
					dragInfo.start = null;
					event.preventDefault();
					slider[0].removeEventListener('mousemove', mover);
					document.removeEventListener('mouseup', movestop);
					if(Math.abs(dragInfo.speed) > 4)
						slideDown()
					else {
						stopSlide();
						scope.setPosition(cposition);
					}

					setTimeout(function(){
						dragInfo.speed = 0;
						dragInfo.isDrag = false;
					})
				}

				function slideDown(){

					if(dragInfo.slideBacker) return;

					var initSpeed = dragInfo.speed * 10,
						cspeed = initSpeed;

					if(dragInfo.slowDowner) clearInterval(dragInfo.slowDowner);

					dragInfo.slowDowner = setInterval(function(){
						scope.setPosition(cposition + cspeed);
						var coeff = 1.2 + (cspeed/initSpeed) * 0.8;
						cspeed /= coeff;
						if(Math.abs(cspeed) < 2){
							stopSlide();
						}
					}, 100);
					return true;
				}

				function slideBack(toPos){
					if(dragInfo.slideBacker){
						clearInterval(dragInfo.slideBacker);
						delete dragInfo.slideBacker;
					};

					if(dragInfo.slowDowner){
						clearInterval(dragInfo.slowDowner);
						delete dragInfo.slowDowner;
					}

					var rspeed = cposition - toPos;
					slider.addClass('pj-draggable');
					roller.addClass('pj-draggable');

					dragInfo.slideBacker = setInterval(function(){
						rspeed /= 2;
						if(Math.abs(Math.round(cposition)) > Math.abs(toPos)){
							scope.setPosition(cposition - rspeed, true);
						}
						else 
							stopBack();
					}, 100);
				}

				function stopBack(){

					if(!dragInfo.start) {
						slider.removeClass('pj-draggable');
						roller.removeClass('pj-draggable');
					}

					if(dragInfo.slideBacker){
						clearInterval(dragInfo.slideBacker);
						delete dragInfo.slideBacker;
					}
				}

				function stopSlide(){
					slider.removeClass('pj-draggable');
					roller.removeClass('pj-draggable');

					if(!dragInfo.slowDowner) return;

					clearInterval(dragInfo.slowDowner);
					dragInfo.slowDowner = null;
				}


				function calcDimensions(){
					cwidth = container.width();
					swidth = slider.outerWidth();
					hwindow = container.width() / 2;
					maxposition = swidth - cwidth;
					var prc = cwidth / swidth,
						rwidth = cwidth * (prc < 1 ?  prc : 1);
					if(rwidth < 50) rwidth = 50;
					roller.width(rwidth);
					rollerpath = cwidth - rwidth;
				}

				angular.extend(scope, {
					container: container,
					isDrag: function(){
						return !!dragInfo.isDrag && Math.abs(dragInfo.distance) > 5;
					},
					setPosition: function(newposition, strong){
						var initBackProcess = null;

						if(cwidth != container.width() || swidth != slider.outerWidth()) calcDimensions();
						if(isNaN(newposition) && maxposition < 0 && (!strong && dragInfo.slideBacker)) return;

						if(!strong)
							if(newposition > 0) {
								newposition = newposition > shiftDeep ? shiftDeep : newposition;
								if(!dragInfo.start) initBackProcess = 0;
							}
							else if(newposition < -maxposition){
								newposition = newposition < -maxposition - shiftDeep ? -maxposition - shiftDeep : newposition;
								if(!dragInfo.start) initBackProcess = -maxposition;
							} else {
								if(dragInfo.slideBacker)
									stopBack();
							}

						if(initBackProcess == null && newposition === cposition) return;
						cposition = newposition;

						var hpos = (-newposition / maxposition) * rollerpath;

						roller.css({left: hpos});
						roller.addClass("active");
						slider.css({left: cposition});

						if(houter) clearTimeout(houter);
						houter = setTimeout(function(){
							roller.removeClass("active");
						}, 1000);

						if(initBackProcess != null) slideBack(initBackProcess);
						return true;
					},
					slideRight: function(){
						stopSlide();
						this.setPosition(cposition - hwindow);
					},
					slideLeft: function(){
						stopSlide();
						this.setPosition(cposition + hwindow);
					}
				});
			}
		}
	}

	function ProjectorGalleryController($scope){
		angular.extend(this, {
			scope: $scope,
			setEmptyBox: function(scope, emptyElement){
				setTimeout(function(){
					$scope.container && $scope.container.append(emptyElement);
				});
			}
		})
	}

	function ProjectorGalleryItemDirective(){
		return {
			restrict: 'EC',
			require: '^pjGallery',
			replace: 'true',
			scope: {
				item: '='
			},
			transclude: true,
			template: '<div class="item" ng-style="{backgroundImage: preparedBackground}"><div class="item-wrapper" ng-click="checkForClick($event)" ng-transclude></div></div>',
			link: function(scope, elem, attr, pjGallery){
				if(scope.item && scope.item.preview){
					scope.preparedBackground = "url("+ (scope.item.preview.preview ? "data:image/jpg;base64," + scope.item.preview.preview : 
						scope.item.preview.previewUrl) +")";
				}

				scope.checkForClick = function(event){
					if(pjGallery.scope.isDrag()){						
						event.stopPropagation();
					}
				}
			}
		}
	}

	function ProjectorGalleryEmptyBox(){
		return {
			restrict: 'C',
			require: '^pjGallery',
			link: function(scope, elem, attr, pjGalleryController){
				elem.attr("disabled", "disabled");
				pjGalleryController.setEmptyBox(scope, elem);
			}
		}
	}
})();
