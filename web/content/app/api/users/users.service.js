(function(){
	'use strict';

	angular.module('projector.api')
		.service('UsersService', UsersService)
	;


	function UsersService(Restangular){
		var userService = Restangular.service("users"),
			loginService = Restangular.service("login"),
			logoutService = Restangular.service("logout")
		;

		return {
			login: function(data){
				return loginService.post(data);
			},
			logout: function(){
				return logoutService.post();
			},
			getUser: function(userId){
				return userService.one(userId).get();
			},
			getCurrentUser: function(){
				return userService.one("current").get();
			}
		};

	};
})();