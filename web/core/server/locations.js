var locations = require('../backend/locations'),
	utils = require('../utils/utils')
;

module.exports.configure = function(app){
	app.get('/projects/:project/locations', getLocationsList);
	app.get('/projects/:project/locations/:location', getLocationItem);
	app.post('/projects/:project/locations', createLocation);
	app.put('/projects/:project/locations/:location', updateLocation);
	app.delete('/projects/:project/locations/:location', deleteLocation);


	locations = locations(app);
}

function getLocationsList(key){
	console.log("[API] Get Locations", key);
	return locations.getLocationsList(key.project, key._metadata).then(list => {
		this.response.set(list);
	})
}

function getLocationItem(key){
	console.log("[API] Get Location", key);
	return locations.getLocationItem(key.location).then(location => this.response.set(location));
}

function _prepareLocation(item){
	return utils.preparePreview(item.preview).then(ipreview => {
		return item;
	});
}

function createLocation(key, item){
	console.log("[API] Create Location", key);
	item._project = key.project;
	return _prepareLocation(item).then(item =>{
		return locations.createLocation(item).then(location => {
			this.response.set(location);
		});
	});
}

function updateLocation(key, item){
	console.log("[API] Update Location", key);
	return _prepareLocation(item).then(item => {
		return locations.updateLocation(item).then(location => {
			this.response.set(location);
		})
	});
}

function deleteLocation(key){
	console.log("[API] Delete Location", key);
	return locations.deleteLocation(key.location).then( result => {
		this.response.set({deleted: true});
	});
}