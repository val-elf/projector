import { Characters } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { utils } from '../utils/utils';

export class CharactersRouter implements IRouter {
	model: Characters;

	configure(app: Service) {

		this.model = new Characters(app);

		app.for(this.model)
			.post('/projects/:project/characters', this.createCharacter)
			.put('/projects/:project/characters/:character', this.updateCharacter)
			.get('/projects/:project/characters', this.getCharacters)
			.get('/projects/:project/characters/:character', this.getCharacter)
			.get('/projects/:project/characters/:character/involvement', this.getCharacterArtifacts)
			.delete('/projects/:project/characters/:character', this.deleteCharacter)
		;
	}

	async _prepareCharacter(character){
		await utils.preparePreview(character.preview);
	}

	createCharacter = async (key, item) => {
		console.warn("[API] Create new character", key);
		item._project = key.project;
		await this._prepareCharacter(item);
		return await this.model.createCharacter(item);
	}


	getCharacters = async (key) => {
		console.warn("[API] Get characters list", key);
		if(key._metadata) {
			if(key._metadata._id === 'undefined') key._metadata._id = [];
		}
		return await this.model.getCharacters({_project: key.project}, key._metadata);
	}

	getCharacter = async (key) => {
		console.warn("[API] Get Character", key);
		if(key.character == 'count') return await this.getCharactersCount.call(this, key);
		return await this.model.getCharacter(key.character);
	}

	getCharactersCount = async (key) => {
		console.warn("[API] Get Characters count of Project", key);
		return await this.model.getCharactersCountFor(key.project);
	}

	updateCharacter = async (key, character) => {
		console.warn("[API] Update Character", key);
		await this._prepareCharacter(character);
		return await this.model.updateCharacter(character);
	}

	getCharacterArtifacts = async (key, item) => {
		console.warn('[API] Get character\'s artifacts');
		return await this.model.getCharactersArtifacts(key.character);
	}

	deleteCharacter = async (key, item) => {
		console.warn("[API] Delete Character", key);
		await this.model.deleteCharacter(key.character);
		return { deleted: true }
	}
}
