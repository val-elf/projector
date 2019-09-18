const Characters = require('../backend/characters');
const utils = require('../utils/utils');

async function _prepareCharacter(character){
	await utils.preparePreview(character.preview);
}

module.exports.configure = function(app){
	const characters = new Characters(app);
	app.for(characters)
		.post('/projects/:project/characters', createCharacter)
		.put('/projects/:project/characters/:character', updateCharacter)
		.get('/projects/:project/characters', getCharacters)
		.get('/projects/:project/characters/:character', getCharacter)
		.get('/projects/:project/characters/:character/involvement', getCharacterArtifacts)
		.delete('/projects/:project/characters/:character', deleteCharacter)
	;
};

async function createCharacter(key, item){
	console.log("[API] Create new character", key);
	item._project = key.project;
	await _prepareCharacter(item);
	return await this.model.createCharacter(item);
}


async function getCharacters(key) {
	console.log("[API] Get characters list", key);
	if(key._metadata) {
		if(key._metadata._id === 'undefined') key._metadata._id = [];
	}
	return await this.model.getCharacters({_project: key.project}, key._metadata);
}

async function getCharacter(key) {
	console.log("[API] Get Character", key);
	if(key.character == 'count') return await getCharactersCount.call(this, key);
	return await this.model.getCharacter(key.character);
}

async function getCharactersCount(key){
	console.log("[API] Get Characters count of Project", key);
	return await this.model.getCharactersCountFor(key.project);
}

async function updateCharacter(key, character){
	console.log("[API] Update Character", key);
	await _prepareCharacter(character);
	return await this.model.updateCharacter(character);
}

async function getCharacterArtifacts(key, item) {
	console.log('[API] Get character\'s artifacts');
	return await this.model.getCharactersArtifacts(key.character);
}

async function deleteCharacter(key, item){
	console.log("[API] Delete Character", key);
	await this.model.deleteCharacter(key.character);
	return { deleted: true }
}