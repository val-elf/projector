var extend = require('extend'),
	characters = require('../backend/characters'),
	utils = require('../utils/utils')
;

module.exports.configure = function(app){
	app.post('/projects/:project/characters', createCharacter);
	app.put('/projects/:project/characters/:character', updateCharacter);
	app.get('/projects/:project/characters', getCharacters);
	app.get('/projects/:project/characters/:character', getCharacter);
	app.delete('/projects/:project/characters/:character', deleteCharacter);
	characters = characters(app);
};


function createCharacter(key, item){
	console.log("[API] Create new character", item);
	item._project = key.project;
	return _prepareCharacter(item).then((function(character){
		return characters.createCharacter(character).then((function(res){
			this.response.set(res);
		}).bind(this));
	}).bind(this));
}

function _prepareCharacter(character){
	return utils.preparePreview(character.preview).then(function(preview){
		return character;
	});
}

function getCharacters(key) {
	console.log("[API] Get characters list", key);
	if(key._metadata){
		if(key._metadata._id === 'undefined') key._metadata._id = [];
	}
	return characters.getCharacters({_project: key.project}, key._metadata).then((function(list){
		this.response.set(list);
	}).bind(this))
}

function getCharacter(key) {
	console.log("[API] Get Character", key);
	if(key.character == 'count') return getCharactersCount.bind(this)(key);

	return characters.getCharacter(key.character).then((function(character){
		this.response.set(character);
	}).bind(this));
}

function getCharactersCount(key){
	console.log("[API] Get Characters count of Project", key);
	var vm = this;
	return characters.getCharactersCountFor(key.project).then(function(count){
		vm.response.set({count: count});
	});
}

function updateCharacter(key, item){
	console.log("[API] Update Character", key);
	return _prepareCharacter(item).then((function(character){
		return characters.updateCharacter(character).then((function(result){
			this.response.set(result);
		}).bind(this));
	}).bind(this));
}

function deleteCharacter(key, item){
	console.log("[API] Delete Character", key);

	return characters.deleteCharacter(key.character).then(result=>{
		this.response.set({deleted: true});
	})
}