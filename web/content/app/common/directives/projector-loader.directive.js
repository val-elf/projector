(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjLoader', ProjectorLoaderDirective)
	;


	function ProjectorLoaderDirective(){
		return {
			restrict: 'E',
			replace: true,
			template: '<div class="loader"></div>',
			link: function(scope, elem, attrs){
				app.loader = scope;
				var pos = 0,
					rollInt,
					swd
				;

				function roller(){
					pos += 1;
					elem[0].className="loader active s" + (pos % 12);
					//elem.css({backgroundPosition: -(pos % 12 * 32)+'px 0'});
				}

				var realShow = function(location){
					if(location) {
						elem.css({
							left: location.left,
							top : location.top
						})
					}
					elem.addClass("active");
					if(!rollInt){
						rollInt = setInterval(roller, 60);
					}
				}

				scope.showLoader = function(value, node){
					if(swd && value) return;
					if(value) {
						var location;
						if(node && typeof(node) === "string") node = document.querySelector(node);
						if(node) {
							node = $(node);
							location = node.offset();
							var st = node.scrollTop();
							var sz = node.parent().height();
							//location.top += sz /2;
						}

						swd = setTimeout(function(){
							realShow(location)
						}, 50);
					} else {
						if(swd) clearTimeout(swd);
						elem.removeClass("active");
						rollInt && clearInterval(rollInt);
						rollInt = null;
						pos = 0;
						swd = null;
					}
				}
			}
		};
	}
})();
