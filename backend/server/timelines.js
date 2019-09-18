const Timelines = require("../backend/timelines");

module.exports.configure = function(app){
	const timelinesModel = new Timelines(app);
    app.for(timelinesModel)
	    .get('/projects/:project/timelines', getProjectTimelines)
	    .post('/projects/:project/timelines', createTimeline)
    	.put('/projects/:project/timelines/:timeline', updateTimeline)
	    .delete('/projects/:project/timelines/:timeline', deleteTimeline)
	    .get('/projects/:project/timelines/:timeline', getTimeline)
}

async function getProjectTimelines(key){
	console.log("[API] Get project ", key.project);
	const list = await this.model.getProjectTimelines(key.project);
    this.response.set(list);
}

async function createTimeline(key, items){
	console.log("[API] Create new timeline", key, items);
	var timeline = items;
	timeline._project = key.project;
	return await this.model.create(timeline);
}

async function updateTimeline(key, tlines){
	console.log("[API] Update Timeline", key);
	if(!(tlines instanceof Array)) tlines = [tlines];
	const timelines = await this.model.update(tlines);
	return timelines.length > 1 ? timelines : timelines[0];
}

async function getTimeline(key){
	console.log("[API] Get Timeline", key);
	return await this.model.getTimeline(key.timeline);
}

async function deleteTimeline(key){
	await timelines.deleteTimeline(key.timeline);
	return { delete: true };
}
