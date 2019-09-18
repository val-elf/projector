const { Core, CommonEntity } = require('./core');
const charModel = Core.getModel('characters');
const artifactModel = Core.getModel('artifacts');

module.exports = class Characters extends CommonEntity {
	async createCharacter(character) {
		const user = await this.app.getCurrentUser();
		character = Core.normalize(character, user);
		return await charModel.create(character);
	}

	async updateCharacter(character) {
		const user = this.app.getCurrentUser();
		character = Core.normalize(character, user);
		character = await charModel.updateItem(character);
		delete character.preview.preview;
		return character;
	}

	async deleteCharacter(charId) {
		await this.app.getCurrentUser();
		return charModel.deleteItem(charId, user);
	}

	async getCharacters(project, metadata){
		const meta = Object.assign({
			sort: {'_update._dt': -1, '_create._dt': -1}
		}, metadata);

		const user = await this.app.getCurrentUser();
		var prms = Object.assign({'_create._user': user._id}, project);

		if(metadata._id){
			if(!(metadata._id instanceof Array)) metadata._id = [metadata._id];
			prms._id = {$in: metadata._id.map(function(item){
				if(item === 'undefined') return undefined;
				return item;
			})};
		}
		const list = await charModel.findList(prms, { 'preview.preview': 0 }, meta);
		/* list.data.forEach(character => {
			delete character.preview;
		});*/
		return list;
	}

	async getCharactersArtifacts(characterId) {
		await this.app.getCurrentUser();
		const list = await artifactModel.findList({ 'characters._character': characterId }, { 'preview.preview': 0 }, {});
		return list.data
			.filter(art => art.characters.find(char => char._character.toString() === characterId))
			.map(art => {
				const charInfo = art.characters.find(char => char._character.toString() === characterId);
				const { role, description } = charInfo;
				const { _id: _artifact, name, preview, type, subtype } = art;
				return { _artifact, name, preview, type, subtype, role, description };
			});
	}

	async getCharactersCountFor(projectId) {
		const user = await this.app.getCurrentUser();
		return charModel.getCountOf({'_create._user': user._id, _project: projectId});
	}

	async getCharacter(charId) {
		if(!charId) throw new Error("Character id must be defined");
		return await charModel.getItem(charId, { 'preview.preview': 0 }, {});
	}
}
