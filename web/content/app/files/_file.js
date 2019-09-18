(function(){
	'use strict';

	angular.module('projector.files', [])
		.config(['$stateProvider', function($stateProvider){
			$stateProvider
				.state('app.file', {
					url: 'file/:fileId',
					templateUrl: 'files/file-page.html',
					controller: 'FileController as fileCtrl',
					resolve: {
						file: ['$stateParams', function($stateParams) {
							return $stateParams.fileId;
						}]
					}

				})
			;
		}]);
})();
