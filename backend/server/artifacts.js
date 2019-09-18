const Artifacts = require('../backend/artifacts');
const utils = require('../utils/utils');

async function _prepareArtifact(item){
	await utils.preparePreview(item.preview);
}

module.exports.configure = function(app){
	const artifacts = new Artifacts(app);
	app.for(artifacts)
		.get('/projects/:project/artifacts', getArtifactsList)
		.get('/projects/:project/artifacts/:artifact', getArtifact)
		.post('/projects/:project/artifacts', createArtifact)
		.put('/projects/:project/artifacts/:artifact', updateArtifact)
		.delete('/projects/:project/artifacts/:artifact', deleteArtifact)
	;

}

async function getArtifactsList(key){
	console.log("[API] Get Artifacts", key);
	return await this.model.getArtifactsList(key.project, key._metadata);
}

async function getArtifact(key){
	console.log("[API] Get Artifact", key);
	return await this.model.getArtifact(key.artifact);
}

async function createArtifact(key, item){
	console.log("[API] Create Artifact", key);
	item._project = key.project;
	await _prepareArtifact(item);
	return await this.model.createArtifact(item);
}

async function updateArtifact(key, item){
	console.log("[API] Update Artifact", key);
	await _prepareArtifact(item);
	return await this.model.updateArtifact(item);
}

async function deleteArtifact(key){
	console.log("[API] Delete Artifact", key);
	await this.model.deleteArtifact(key.artifact);
	return { deleted: true };
}