var timespots = require('../backend/timespots');

module.exports.configure = function(app){

	app.put('/timespots/:timespot', updateTimespot);
	app.post('/timespots', createTimespot);
	app.delete('/timespots/:timespot', deleteTimespot);
	timespots = timespots(app);
}


function updateTimespot(key, item){
	console.log("[API] Update timespot", item);
	return timespots.update(item).then((function(timespot){
		this.response.set(timespot);
	}).bind(this));
}

function createTimespot(key, item){
	console.log("[API] Create single timespot", item);
	return timespots.createTimespot(item).then((function(timespot){
		this.response.set(timespot);
	}).bind(this));
}

function deleteTimespot(key){
	console.log("[API] Delete timespot", key.timespotId);
	return timespots.deleteTimespot(key.timespot).then((function(){
		this.response.set({timespot: key.timespot});
	}).bind(this));
}