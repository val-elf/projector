(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('projectorMessageCenter', ProjectorMessageCenter)
	;

	function ProjectorMessageCenter($compile){
		return {
			restrict: 'E',
			replace: true,
			scope: true,
			template: '<div class="message-center"></div>',
			link: function(scope, elem, attrs){
				var messageBox = $('<div class="message-box"></div>');
				elem.append(messageBox);

				scope.$on('addMessage', function(event, params){
					scope.addMessage(params);
				});

				scope.addMessage = function(params){
					if(params){
						var type = "message", message = params.message || '';
						if(params.error) type = "error";
						else if(params.type) type = params.type;

						if(type === "error") {
							if(params.error){
								message += ": " + params.error.data;
								switch(params.error.status){
									case 404: message += " (service not found)"; break;
									case 500: message += " (server error)"; break;
									case 401: message += " (unauthorized)"; break;
								}
							}
						}
						var box = $('<div class="message ' + type + '"/>');
						box.html(message.toString());

						messageBox.prepend(box);
						box.css({'marginTop': -box.outerHeight() - 10});							
						setTimeout(function(){
							box.addClass("operated");
							box.css({marginTop: 0});							
						}, 100);

						setTimeout(function(){
							box.addClass("removed");
							setTimeout(function(){
								box.remove();
							}, 400);
						}, 3000);
					}					
				}

				app.messageCenter = scope;
			}
		}
	}
})();
