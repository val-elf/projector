(function(){
	'use strict';
	angular.module('projector.services')
		.service('modal', Modal);

	function Modal($modal, $rootScope, $q){
		return {
			open : function(options){
				var prnt = options.scope && options.scope.$new && options.scope || $rootScope , 
					sc = prnt.$new(),
					_onSave = [], defer = $q.defer();

				angular.extend(sc, {
					save: function(){
						_onSave.forEach(function(cb){
							cb && cb(sc);
						});
					},
					onSave: function(callback){						
						if(angular.isFunction(callback)) _onSave.push(callback);
					}
				}, options.params);

				sc.$emit('showModal', {});

				function checkbackspace (event){
					if(event.keyCode == 8){
						var ae = document.activeElement;
						if(ae.tagName !== "INPUT" && !ae.contentEditable)
							event.preventDefault();
					}
				}

				$(document).on('keydown', checkbackspace);

				this.instance = $modal.open({
					templateUrl: options.templateUrl,
					scope: sc,
					controller: options.controller,
					controllerAs: options.controllerAs,
					//size: 'wide',
					backdrop: 'static'
				});

				this.instance.result.then(function(){
					$(document).off('keydown', checkbackspace);
					defer.resolve();
				}, function(){
					$(document).off('keydown', checkbackspace);
					defer.reject();
				});

				return defer.promise;
			},

			close: function(){
				this.instance && this.instance.close();
			}
		}
	}
})();
