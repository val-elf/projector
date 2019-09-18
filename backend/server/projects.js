const Projects = require("../backend/projects");
const u = require('../utils/utils');

async function prepareProject(project){
	await u.preparePreview(project.preview);
	return project;
}

module.exports.configure = function(app){
	const projectModel = new Projects(app);

	app.for(projectModel)
		.get('/projects', getProjects)
		.post('/projects', createProject)
		.put('/projects/:project', updateProject)
		.get('/projects/:project', getProject)
	;
}

async function getProjects(key){
	console.log("[API] Get projects list", key);
	return await this.model.getProjects(key._metadata);
}

async function getProject(key){
	console.log("[API] Get Project", key);
	return await this.model.getProject(key.project);
}

async function createProject(key, project){
	console.log("[API] Create new project", key);
	await prepareProject(project);
	return await this.model.createProject(project);
}

async function updateProject(key, project) {
	console.log("[API] Update project", key);
	await prepareProject(project);
	return await this.model.updateProject(project)
}
