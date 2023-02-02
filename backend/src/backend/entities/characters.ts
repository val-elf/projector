import { DbBridge, DbModel } from '../core/db-bridge';
import { TFindList, TObjectId } from '../core/models';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { IArtifact, ICharacter, IMetadata, IUser } from './models/db.models';

@DbModel({ model: 'characters' })
export class Characters extends DbObjectAncestor<ICharacter> {
	artifactModel = DbBridge.getBridge<IArtifact>('artifacts');

	@PermissionsCheck({ permissions: [] })
	public async createCharacter(character: ICharacter, user?: IUser) {
		character = DbObjectController.normalize(character, user);
		return await this.model.create(character);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateCharacter(character: ICharacter, user?: IUser) {
		character = DbObjectController.normalize(character, user);
		character = await this.model.updateItem(character);
		delete character.preview.preview;
		return character;
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteCharacter(charId: TObjectId, user?: IUser) {
		return this.deleteItem(charId, user);
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharacters(project, metadata: IMetadata, user?: IUser){
		const meta = Object.assign({
			sort: {'_update._dt': -1, '_create._dt': -1}
		}, metadata);

		const prms = Object.assign({'_create._user': user._id}, project);

		if(metadata._id){
			if(!(metadata._id instanceof Array)) metadata._id = [metadata._id as string];
			prms._id = {$in: metadata._id.map(item => {
				if(item === 'undefined') return undefined;
				return item;
			})};
		}

		const list = await this.model.findList(prms, { 'preview.preview': 0 }, meta);
		return list;
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharactersArtifacts(characterId: TObjectId) {
		const list = await this.artifactModel.findList({ 'characters._character': characterId }, { 'preview.preview': 0 }, {});
		return (list as TFindList<IArtifact>).result
			.filter(art => art.characters.find(char => char._id.toString() === characterId))
			.map(art => {
				const charInfo = art.characters.find(char => char._id.toString() === characterId);
				const { role, description } = charInfo;
				const { _id: _artifact, name, preview, type, subtype } = art;
				return { _artifact, name, preview, type, subtype, role, description };
			});
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharactersCountFor(projectId, user?: IUser) {
		return this.model.getCountOf({'_create._user': user._id, _project: projectId});
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharacter(charId) {
		if(!charId) throw new Error("Character id must be defined");
		return await this.model.getItem(charId, { 'preview.preview': 0 });
	}
}
