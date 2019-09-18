const navData = require('../_navigation/navigation.js')();

module.exports.configure = function(app){
	app.get('/navigation', getNavigation);
}


async function getNavigation(){
	console.log("[API] Get navigation", navData);
	try{
		const user = await this.app.getCurrentUser();
		const dataRes = [];
		user.roles && user.roles.forEach(role => {
			if(navData[role.name])
				dataRes.push.apply(dataRes, navData[role.name].pages);
		});
		return dataRes;
	} catch(error) {
		this.response.setError(error);
	};
}