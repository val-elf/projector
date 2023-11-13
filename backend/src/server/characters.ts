import { Route } from '~/network';
import { Characters } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { utils } from '../utils/utils';
import { EMethod, Router } from '~/network/route.decorator';
import { IArtifact, ICharacter, IInitCharacter } from '~/backend/entities/models';

// @OA:tag
// name: Characters
// description: Project's characters management API
@Router()
export class CharactersRouter implements IRouter {
	model: Characters;

	configure(app: Service) {
		this.model = new Characters(app);
	}

	// @OA:route
	// description: Get count of characters
	// security: [APIKeyHeader: []]
	// parameters: [projectId: Id of the Project]
	// responses: [200: Count of the characters, 401: Bad Request]
	@Route(EMethod.GET, '/projects/:projectId/characters/count')
	public async getCharactersCount(key): Promise<{ count: number }> {
		console.warn('[API] Get Characters count of Project', key);
		return { count: await this.model.getCharactersCountFor(key.projectId) };
	}

	// @OA:route
	// description: Get character by its ID
	// security: [APIKeyHeader: []]
	// parameters: [projectId: Id of the Project]
	// responses: [200: Created Character Item, 401: Bad Request]
	// requestBody: [item: IInitCharacter]
	@Route(EMethod.POST, '/projects/:projectId/characters')
	public async createCharacter(key, item: IInitCharacter): Promise<ICharacter> {
		console.warn('[API] Create new character', key);
		return await this.model.createCharacter(item, key.projectId);
	}

	// @OA:route
	// security: [APIKeyHeader: []]
	// description: Get characters list
	// parameters: [projectId: Id of the Project]
	// responses: [200: Get Characters by Project, 401: Bad Request]
	@Route(EMethod.GET, '/projects/:projectId/characters')
	public async getCharacters(key): Promise<ICharacter[]> {
		console.warn('[API] Get characters list', key);
		if(key._metadata) {
			if(key._metadata._id === 'undefined') key._metadata._id = [];
		}
		return await this.model.getCharacters(key.projectId, key._metadata);
	}

	// @OA:route
	// description: Get particular character by its Id
	// security: [APIKeyHeader: []]
	// parameters: [characterId: Id of the character]
	// responses[200: Character Item, 401: Bad Request]
	@Route(EMethod.GET, '/characters/:characterId')
	public async getCharacter(key): Promise<ICharacter> {
		console.warn('[API] Get Character', key);
		return await this.model.getCharacter(key.characterId);
	}

	// @OA:route
	// description: Update particular character
	// security: [APIKeyHeader: []]
	// parameters: [characterId: Id of the character]
	// requestBody: [item: IInitCharacter]
	// responses: [200: Character Item, 401: Bad Request]
	@Route(EMethod.PUT, '/characters/:characterId')
	public async updateCharacter(key, character: IInitCharacter): Promise<ICharacter> {
		console.warn('[API] Update Character', key);
		return await this.model.updateCharacter(key.characterId, character);
	}

	// @OA:route
	// description: Get character's artifacts
	// security: [APIKeyHeader: []]
	// parameters: [characterId: Id of the character]
	// responses: [200: Character Artifacts]
	@Route(EMethod.GET, '/characters/:characterId/involvement')
	public async getCharacterArtifacts(key): Promise<IArtifact[]> {
		console.warn('[API] Get character\'s artifacts');
		return await this.model.getCharacterArtifacts(key.characterId);
	}

	// @OA:route
	// description: Delete character
	// security: [APIKeyHeader: []]
	// parameters: [characterId: Id of the character]
	// responses: [200: Deleted operation flag, 401: Bad Request]
	@Route(EMethod.DELETE, '/characters/:characterId')
	public async deleteCharacter(key): Promise<{ deleted: boolean }> {
		console.warn('[API] Delete Character', key);
		await this.model.deleteCharacter(key.characterId);
		return { deleted: true }
	}
}
