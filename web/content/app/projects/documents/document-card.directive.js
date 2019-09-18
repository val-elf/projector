(function(){
	'use strict';

	angular.module('projector.directives')
		.directive('pjDocumentCard', ProjectorDocumentCardDirective)
		.controller('DocumentCardController', ProjectorDocumentCardController)
	;

	function ProjectorDocumentCardDirective(){
		return {
			restrict: 'E',
			scope: {
				document: '='
			},
			templateUrl: 'projects/documents/document.card.html',
			link: function(scope, elem, attr, ctrl){
				scope.item = scope.document && scope.document.plain() || {};
				angular.extend(scope.$parent, {
					isDisabled: function(){
						return !scope.documentForm.$valid;
					},
					save: function(){
						angular.extend(scope.document, scope.item);
						scope.document.save().then(function(){
							scope.$parent.$close();
						})
					}
				})

			}
		}
	}

	function ProjectorDocumentCardController($scope){
	}

})();

