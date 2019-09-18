const Locations = require('../backend/locations');
const utils = require('../utils/utils');

async function _prepareLocation(item){
	await utils.preparePreview(item.preview);
}

module.exports.configure = function(app){
	const locations = new Locations(app);
	app.get('/projects/:project/locations', getLocationsList, locations);
	app.get('/projects/:project/locations/:location', getLocationItem, locations);
	app.post('/projects/:project/locations', createLocation, locations);
	app.put('/projects/:project/locations/:location', updateLocation, locations);
	app.delete('/projects/:project/locations/:location', deleteLocation, locations);
}

async function getLocationsList(key){
	console.log("[API] Get Locations", key);
	return await this.model.getLocationsList(key.project, key._metadata);
}

async function getLocationItem(key){
	console.log("[API] Get Location", key);
	return this.model.getLocationItem(key.location);
}


async function createLocation(key, item){
	console.log("[API] Create Location", key);
	item._project = key.project;
	await _prepareLocation(item);
	return this.model.createLocation(item);
}

async function updateLocation(key, item){
	console.log("[API] Update Location", key);
	await _prepareLocation(item);
	return this.model.updateLocation(item);
}

async function deleteLocation(key){
	console.log("[API] Delete Location", key);
	await this.model.deleteLocation(key.location);
	return { deleted: true };
}