import { DbBridge, DbModel } from '../core/db-bridge';
import { DbObjectAncestor } from './dbobjects';
import { IArtifact, ICharacter } from './models/db.models';

@DbModel({ model: 'characters' })
export class Characters extends DbObjectAncestor<ICharacter> {
	artifactModel = DbBridge.getBridge<IArtifact>('artifacts');

	async createCharacter(character) {
		character = this.dbObject.normalize(character);
		return await this.model.create(character);
	}

	async updateCharacter(character) {
		character = this.dbObject.normalize(character);
		character = await this.model.updateItem(character);
		delete character.preview.preview;
		return character;
	}

	async deleteCharacter(charId) {
		return this.deleteItem(charId);
	}

	async getCharacters(project, metadata){
		const meta = Object.assign({
			sort: {'_update._dt': -1, '_create._dt': -1}
		}, metadata);

		const prms = Object.assign({'_create._user': this.user._id}, project);

		if(metadata._id){
			if(!(metadata._id instanceof Array)) metadata._id = [metadata._id];
			prms._id = {$in: metadata._id.map(function(item){
				if(item === 'undefined') return undefined;
				return item;
			})};
		}
		const list = await this.model.findList(prms, { 'preview.preview': 0 }, meta);
		/* list.data.forEach(character => {
			delete character.preview;
		});*/
		return list;
	}

	async getCharactersArtifacts(characterId) {
		const list = await this.artifactModel.findList({ 'characters._character': characterId }, { 'preview.preview': 0 }, {});
		return (list).result
			.filter(art => art.characters.find(char => char._id.toString() === characterId))
			.map(art => {
				const charInfo = art.characters.find(char => char._id.toString() === characterId);
				const { role, description } = charInfo;
				const { _id: _artifact, name, preview, type, subtype } = art;
				return { _artifact, name, preview, type, subtype, role, description };
			});
	}

	async getCharactersCountFor(projectId) {
		return this.model.getCountOf({'_create._user': this.user._id, _project: projectId});
	}

	async getCharacter(charId) {
		if(!charId) throw new Error("Character id must be defined");
		return await this.model.getItem(charId, { 'preview.preview': 0 });
	}
}
