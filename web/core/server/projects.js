var projects = require("../backend/projects"),
	timelines = require("../backend/timelines"),
	q = require('node-promise'),
	u = require('util'),
	pu = require('../utils/utils')
;

module.exports.configure = function(app){
	app.get('/projects', getProjects);
	app.post('/projects', createProject);
	app.put('/projects/:project', updateProject);
	app.get('/projects/:project', getProject);
	app.get('/projects/:project/timelines', getProjectTimelines);
	app.post('/projects/:project/timelines', createTimeline);
	app.put('/projects/:project/timelines/:timeline', updateTimeline);
	app.delete('/projects/:project/timelines/:timeline', deleteTimeline);
	app.get('/projects/:project/timelines/:timeline', getTimeline);

	projects = projects(app);
	timelines = timelines(app);
}

function getProjects(key){
	console.log("[API] Get projects list", key);
	var p = new q.Promise();
	return projects.getProjects(key._metadata).then((function(list){
		var t = this;
		setTimeout(function(){
			t.response.set(list);
			p.resolve(list);
		}, 1);
		return p;
	}).bind(this));
}

function getProject(key){
	console.log("[API] Get Project", key);
	return projects.getProject(key.project).then((function(project){
		this.response.set(project);
	}).bind(this));
}

function createProject(key, items){
	console.log("[API] Create new project", key);

	return prepareProject(items).then((function(project){
		return projects.createProject(items).then((function(project){
			this.response.set(project);
		}).bind(this));
	}).bind(this));
}

function prepareProject(project){
	return pu.preparePreview(project.preview).then(function(preview){
		return project;
	});
}

function updateProject(key, items) {
	console.log("[API] Update project", key);

	return prepareProject(items).then((function(project){
		return projects.updateProject(project).then((function(project){
			return this.response.set(project);
		}).bind(this));
	}).bind(this));
}

function getProjectTimelines(key){
	console.log("[API] Get project ", key.project, " timelines", timelines);
	return timelines.getProjectTimelines(key.project).then((function(list){
		this.response.set(list);
	}).bind(this));
}

function createTimeline(key, items){
	console.log("[API] Create new timeline", key, items);
	var timeline = items;

	timeline._project = key.project;

	return timelines.create(timeline).then((function(created){
		this.response.set(created);
	}).bind(this));
}

function updateTimeline(key, tlines){
	console.log("[API] Update Timeline", key);
	if(!u.isArray(tlines))
		tlines = [tlines];
	return timelines.update(tlines).then((function(timelines){
		this.response.set(timelines.length>1 ? timelines : timelines[0]);
	}).bind(this));
}

function getTimeline(key){
	console.log("[API] Get Timeline", key);
	return timelines.getTimeline(key.timeline).then((function(timeline){
		this.response.set(timeline)
	}).bind(this));
}

function deleteTimeline(key){
	return timelines.deleteTimeline(key.timeline).then((function(tl){
		this.response.set(null);
	}).bind(this));
}
