var cathegories = require('../backend/cathegories');

module.exports.configure = function(app){
	app.get('/owner/:object/cathegories/', getObjectCathegories);
	app.post('/owner/:object/cathegories/', createCathegory);
	app.put('/owner/:object/cathegories/:cathegory', updateCathegory);

	cathegories = cathegories(app);
}

function getObjectCathegories(key){
	console.log("[API] Get owner Cathegories", key);
	return cathegories.getOwnerCathegories(key.object).then((function(cathegories){
		this.response.set(cathegories);
	}).bind(this));
}


function createCathegory(key, cathegory){
	console.log("[API] Create cathegory", key);
	return cathegories.createCathegory(cathegory, key.object).then((function(cat){
		this.response.set(cat);
	}).bind(this));
}

function updateCathegory(key, cathegory){
	console.log("[API] Update cathegory", key);
	return cathegories.updateCathegory(cathegory).then((function(cat){
		this.response.set(cat)
	}).bind(this));
}