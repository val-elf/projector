(function(){
	'use strict';

	angular.module('projector.settings', [])
		.config(['$stateProvider', function($stateProvider){
			$stateProvider
				.state('app.settings', {
					url: 'settings',
					templateUrl: 'settings/settings.html'
				})
				.state('app.tasks', {
					url: 'tasks',
					template: '<h1 class="page-head">Tasks</h1>'
				})
				.state('app.users', {
					url: 'users',
					template: '<h1 class="page-head">Users</h1>'
				})
		}])
	;
})();