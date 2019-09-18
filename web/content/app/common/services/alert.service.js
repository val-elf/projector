(function(){
	'use strict';
	angular.module('projector.services')
		.service('alert', AlertService)
		.directive('pjAlertContent', ProjectorAlertContentDirective)
	;

	function ProjectorAlertContentDirective(){
		return {
			restrict: 'E',
			template: '<div class="modal-body"></div>',
			replace: true,
			link: function(scope, elem, attr){
				elem.append(scope.content);
			}
		}
	}

	function AlertService($modal, $rootScope, $sce, $q, $compile){

		function ShowMessage(message){
			$rootScope.$broadcast('addMessage', message);
		}

		return function(options) {
			var sc = $rootScope.$new(), res = $q.defer();

			sc.content = options.message
				? $('<div>').append(options.message)
				: options.template && $compile('<div>'+options.template+'</div>')(options.scope || sc) ;

			sc.isConfirm = !!options.isConfirm;
			sc.okButton = options.okButton;

			if(options.isMessage) {
				ShowMessage({
					error: options.error,
					message: sc.message
				})
				res.resolve(true);
			} else {
				sc.close = function(value){
					res.resolve(value);
					mi.close();
				}
				var mi = $modal.open({
					templateUrl: 'common/services/alert.html',
					scope: sc,
					controller: options.controller,
					backdrop: 'static'
				});

				sc.$emit('showModal', {});

			}
			return res.promise;
		}
	}
})();
