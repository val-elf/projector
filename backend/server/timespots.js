const Timespots = require('../backend/timespots');

module.exports.configure = function(app){
	app.for(new Timespots(app))
		.put('/timespots/:timespot', updateTimespot)
		.post('/timespots', createTimespot)
		.delete('/timespots/:timespot', deleteTimespot)
	;
}

async function updateTimespot(key, timespot){
	console.log("[API] Update timespot", key);
	return this.model.update(timespot);
}

async function createTimespot(key, timespot){
	console.log("[API] Create single timespot", key);
	return await this.model.createTimespot(timespot)
}

async function deleteTimespot(key){
	console.log("[API] Delete timespot", key.timespotId);
	await this.model.deleteTimespot(key.timespot);
	return { delete: true };
}