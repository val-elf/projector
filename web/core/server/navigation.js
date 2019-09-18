var _app;
var navData = require('../_navigation/navigation.js')(),
	extend = require('extend')
;

module.exports.configure = function(app){
	app.get('/navigation', getNavigation);
	_app = app;
}


function getNavigation(){
	console.log("[API] Get navigation", navData);
	var vm = this, cu = _app.get;

	return _app.getCurrentUser().then(function(user){
		var dataRes = [];
		user.roles && user.roles.forEach(function(role){
			console.log("USEROLE ", role, navData[role.name], navData);
			if(navData[role.name])
				dataRes = dataRes.concat(navData[role.name].pages);

		});
		vm.response.set(dataRes);
	});
}