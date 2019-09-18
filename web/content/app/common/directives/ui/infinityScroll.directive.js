(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('infinityScroll', InfinityScrollDirective)
		.directive('infinityScrollLoader', InfinityScrollLoaderDirective);

	function InfinityScrollDirective($parse, $q, $compile){
		return {
			restrict: 'A',
			link: function($scope, $elem, $attrs){
				var onScrollEnd = $parse($attrs.onScrollEnd), dock = $($elem);

				$scope.onscroll = false;

				var loader = $compile('<infinity-scroll-loader shows="onscroll"></infinity-scroll-loader>')($scope);

				$(document.body).append(loader);

				$scope.$on('$destroy', function(){
					window.removeEventListener('scroll', checkIsOnView);
				});

				window.addEventListener('scroll', checkIsOnView);

				$scope.$watch(
					function(){return dock.height();},
					checkIsOnView
				);

				function checkIsOnView(ht) {
					var isVisible = dock[0].offsetTop + dock.height() - window.scrollY - document.body.clientHeight < 0;
					if(!$scope.onscroll && isVisible){
						$scope.onscroll = true;						
						try{
							$q.when(onScrollEnd($scope), function(){
								$scope.onscroll = false;
								$scope.$evalAsync();
							}, function(){
								$scope.onscroll = false;
								$scope.$evalAsync();
							});
						} catch(err){
							$scope.onscroll = false;
							$scope.$evalAsync();
						}
					}
				}
			}
		}
	}

	function InfinityScrollLoaderDirective(){
		return {
			restric: 'E',
			replace: true,
			scope: {
				shows: '='
			},
			templateUrl: 'common/directives/ui/infinityScrollLoader.html'
		}
	}
})();
