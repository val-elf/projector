import { TObjectId } from '~/backend/core/models';
import { IGenerationScript } from '../model';
import { GenerateProjects } from './generate-projects';
import { IInitDocument } from '~/backend/entities/models';
import { utils } from '../utils';
import { core } from '../core';

export class GenerateDocuments implements IGenerationScript {
    public async *generate() {
        const projects = await GenerateProjects.getRandomProjects(10);
        const projectIds = projects.map(p => p._id);

        // generate new documents
        yield *this.generateNewDocuments(projectIds);

    }

    private async *generateNewDocuments(projectIds: TObjectId[]) {
        for await(const projectId of projectIds) {
            const documentsCount = Math.round(Math.random() * 25) + 3;
            for(let a = 0; a < documentsCount; a++) {
                const document = await this.createDocument();
                yield await core.post(`/owner/${projectId}/documents`, document);
            }
        }
    }

    private async createDocument(): Promise<IInitDocument> {
        const preview = await utils.loadImage();
        return {
            title: utils.textGenerator.getEntities(2, 2, Math.round(Math.random()*5 + 10), true),
            preview,
        } as IInitDocument;
    }
}