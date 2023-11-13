import { utils } from '~/utils/utils';
import { DbBridge, DbModel } from '../core';
import { IFindList, TObjectId } from '../core/models';
import { DbObjectAncestor } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';
import { IArtifact, ICharacter, IDbObject, IInitCharacter, IMetadata, IOwned, IPreviewed, IUser } from './models';

type TCharacterUpdate = IInitCharacter & Partial<IPreviewed>;
const updateCharacterToDb = async (character: IInitCharacter): Promise<TCharacterUpdate> => {
	return await utils.preparePreview<TCharacterUpdate>(character);
}
@DbModel({ model: 'characters' })
export class Characters extends DbObjectAncestor<ICharacter, TCharacterUpdate> {
	artifactModel = DbBridge.getBridge<IArtifact>('artifacts');
	dbObjectModel = DbBridge.getBridge<IDbObject>('dbobjects');

	@PermissionsCheck({ permissions: [] })
	public async createCharacter(
		character: IInitCharacter,
		projectId: string,
		user?: IUser
	) {
		this.setOwners([projectId]);
		const createItem = await updateCharacterToDb(character);
		return await this.model.create(createItem);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateCharacter(characterId: string, character: IInitCharacter) {
		if (characterId !== character._id) throw new Error('Character id mismatch');
		const updateItem = await updateCharacterToDb(character);
		const result = await this.model.updateItem(updateItem);
		// delete character.preview.preview;
		return result;
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteCharacter(charId: TObjectId) {
		return this.deleteItem(charId);
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharacters(projectId: string, metadata: IMetadata){
		this.setOwners(projectId);

		/*if(metadata._id){
			if(!(metadata._id instanceof Array)) metadata._id = [metadata._id as string];
			prms._id = {$in: metadata._id.map(item => {
				if(item === 'undefined') return undefined;
				return item;
			})};
		}*/

		const list = (await this.model.findList({}, { 'preview.preview': 0 }, metadata)) as IFindList<ICharacter>;
		return list.result;
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharacterArtifacts(characterId: TObjectId) {
		const list = await this.artifactModel.findList(
			{ '__owners': { '$in': [characterId] } },
			{ 'preview.preview': 0 }
		);

		return (list as IFindList<IArtifact & IOwned>).result;
			// .filter(art => art.characters.find(char => char._id.toString() === characterId))
			/*.map(async art => {
				const charObjects = await this.dbObjectModel
					.findList(
						{ '_id': { '$in': art.__owner._owners }, 'type': 'characters', 'status': 'normal' },
						{ 'preview.preview': 0 }
					);
				const charInfo = art.characters.find(char => char._id.toString() === characterId);
				const { role, description } = charInfo;
				const { _id: _artifact, name, preview, type, subtype } = art;
				return { _artifact, name, preview, type, subtype, role, description };
			})*/
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharactersCountFor(projectId, user?: IUser) {
		this.setOwners([projectId, user?._id]);
		return this.model.getCountOf({});
	}

	@PermissionsCheck({ permissions: [] })
	public async getCharacter(charId) {
		if(!charId) throw new Error("Character id must be defined");
		return await this.model.getItem(charId, { 'preview.preview': 0 });
	}
}
