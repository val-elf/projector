var artifacts = require('../backend/artifacts'),
	utils = require('../utils/utils')
;

module.exports.configure = function(app){
	app.get('/projects/:project/artifacts', getArtifactsList);
	app.get('/projects/:project/artifacts/:artifact', getArtifact);
	app.post('/projects/:project/artifacts', createArtifact);
	app.put('/projects/:project/artifacts/:artifact', updateArtifact);
	app.delete('/projects/:project/artifacts/:artifact', deleteArtifact);

	artifacts = artifacts(app);
}

function getArtifactsList(key){
	console.log("[API] Get Artifacts", key);
	return artifacts.getArtifactsList(key.project, key._metadata).then(list => {
		this.response.set(list);
	})
}

function getArtifact(key){
	console.log("[API] Get Artifact", key);
	return artifacts.getArtifact(key.artifact).then(artifact => this.response.set(artifact) );
}

function _prepareArtifact(item){
	return utils.preparePreview(item.preview).then(ipreview => {
		return item;
	});
}

function createArtifact(key, item){
	console.log("[API] Create Artifact", key);
	item._project = key.project;
	return _prepareArtifact(item).then(item =>{
		return artifacts.createArtifact(item).then(artifact => {
			this.response.set(artifact);
		});
	});
}

function updateArtifact(key, item){
	console.log("[API] Update Artifact", key);
	return _prepareArtifact(item).then(item => {
		return artifacts.updateArtifact(item).then(artifact => {
			this.response.set(artifact);
		})
	});
}

function deleteArtifact(key){
	console.log("[API] Delete Artifact", key);
	return artifacts.deleteArtifact(key.artifact).then( result => {
		this.response.set({deleted: true});
	});
}