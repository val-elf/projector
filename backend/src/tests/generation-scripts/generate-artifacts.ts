import { EArtifactType, EArtifactSubtype, IInitArtifact } from '~/backend/entities/models';
import { core } from '../core';
import { IGenerationScript } from '../model';
import { utils } from '../utils';
import { GenerateProjects } from './generate-projects';
import { TObjectId } from '~/backend/core/models';

export class GenerateArtifacts implements IGenerationScript {
    public async *generate() {
        //get three random projects
        const projects = await GenerateProjects.getRandomProjects();
        const projectIds = projects.map(p => p._id);
        for await(let artifact of this.genArtifacts(projectIds)) {
            //console.log('Artifact', artifact);
        }

        // console.log('------------------------------ Artifacts generated! ------------------------------');
        const artifacts = (await core.get(`/projects/${projectIds[0]}/artifacts`));
        // console.log('Artifacts', artifacts);

        yield true;
    }

    private async *genArtifacts(projectIds: TObjectId[]) {
        for(let projectId of projectIds) {
            for(let i = 0; i < 5; i++) {
                const artifact = await this.createArtifact();
                yield core.post('/projects/' + projectId + '/artifacts', artifact);
            }
        }
    }

    private async createArtifact(): Promise<IInitArtifact> {
        const artifactName = utils.textGenerator.genPhrase(1, 2, 14, true);
        return {
            name: artifactName,
            preview: await utils.loadImage(),
            type: EArtifactType.Item,
            subtype: EArtifactSubtype.FireArms,
        }
    }
}