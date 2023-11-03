import { ICharacter, IInitCharacter } from '~/backend/entities/models';
import { core } from '../core';
import { IGenerationScript } from '../model';
import { utils } from '../utils';
import { GenerateProjects } from './generate-projects';
import { TObjectId } from '~/backend/core/models';

export class GenerateCharacters implements IGenerationScript {

    public async *generate() {
        const projects = await GenerateProjects.getRandomProjects();
        const projectIds = projects.map(p => p._id);

        // generate new characters
        yield *this.generateNewCharacters(projectIds);

        // check if characters are created
        const projectId = projectIds[0];
        const characters = await core.get(`/projects/${projectId}/characters`);

        const character = await this.checkGettingSingleCharacter(characters[0]._id).next();
        yield *this.updateExistingCharacter(character.value as ICharacter);
        yield true;
    }

    private async *generateNewCharacters(projectIds: TObjectId[]) {
        for await(const projectId of projectIds) {
            const character = await this.createCharacter();
            const characters = await core.post(`/projects/${projectId}/characters`, character);
        }
    }

    private async *checkGettingSingleCharacter(characterId: TObjectId) {
        const character = await core.get<ICharacter>(`/characters/${characterId}`);
        yield character;
    }

    private async *updateExistingCharacter(character: ICharacter) {
        const { _id } = character;
        await core.put(`/characters/${_id}`, character);
        const ucharacter = await core.get(`/characters/${_id}?updateDate&createDate`);
        yield true;
    }

    private async createCharacter(): Promise<IInitCharacter> {
        const preview = await utils.loadImage();
        return {
            name: utils.textGenerator.getEntities(2, 2, Math.round(Math.random()*5 + 10), true),
            preview,
            role: 'protagonist',
            description: utils.textGenerator.getText(Math.round(Math.random() * 5) + 3),
        } as IInitCharacter;
    }
}