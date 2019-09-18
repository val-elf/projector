'use strict';

(function(){
	angular.module('projector')
		.config(['$stateProvider', '$locationProvider', '$httpProvider',
			function($stateProvider, $locationProvider, $httpProvider){
				$stateProvider
					.state('app', {
						url: "/",
						abstract: true,
						templateUrl: 'common/layout.html',
						controller: 'LayoutController as rootCtrl',
						resolve: {
							app: function(){return app.application;}
						}
					})
					.state('login', {
						url: '/login',
						templateUrl: 'common/auth.html',
						controller: 'AuthorizationController as authCtrl'
					})
					.state('logout', {
						url: '/logout',
						controller: 'AuthorizationController as authCtrl'
					})
				;
				$locationProvider.html5Mode(true);

		}])
		.controller('AuthorizationController', function($scope, $state, UsersService, $cookies){
			var vm = this;			
			if($state.current.name == 'logout') {
				UsersService.logout().then(function(res){
					$cookies.remove("_session");
					location.assign('/');
				})
			}
			$scope.authorize = function(){
				UsersService.login({login: this.login, password: this.password}).then(function(res){
					if(res)	location.assign('/');
					return res;
				}, function(error){
					if(error.status == 403){
						$scope.error = {
							message: 'Пользователь не найден или неправильный пароль'
						};
					}
				});
			}
		})
		.controller('LayoutController', function($rootScope, $state, UsersService, $location){
			UsersService.getCurrentUser().then(function(currentUser){
				app.rootScope = $rootScope;
				$rootScope.user = currentUser;
				$rootScope.$state = $state;
			}, function(error){
				$state.go('login');
			});

		});


})();

