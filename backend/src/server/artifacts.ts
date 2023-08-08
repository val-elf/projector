import { Artifacts } from '../backend/entities/artifacts';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { utils } from '~/utils/utils';
import { Route } from '~/network';
import { EMethod, Router } from '~/network/route.decorator';
import { IArtifact } from '~/backend/entities/models';

// @OA:tag
// name: Artifacts
// description: Project's artifacts management API
@Router()
export class ArtifactRouter implements IRouter {
    public model: Artifacts;

    private async _prepareArtifact(item) {
        await utils.preparePreview(item.preview);
    }

    configure(app: Service) {
        this.model = new Artifacts(app);
    }

    // @OA:route
    // description: Get list of artifacts for particular project
    // security: [APIKeyHeader: []]
    // response: [200: List of artifacts of the project, 401: Bad request]
    // parameter: []
    @Route(EMethod.GET, '/projects/:project/artifacts')
    public async getArtifactsList(key): Promise<IArtifact[]> {
        console.warn('[API] Get Artifacts', key);
        return await this.model.getArtifactsList(key.project, key._metadata);
    }

    // @OA:route
    // description: Get artifact by its ID
    @Route(EMethod.GET, '/artifacts/:artifact')
    public async getArtifact(key) {
        console.warn('[API] Get Artifact', key);
        return await this.model.getArtifact(key.artifact);
    }

    // @OA:route
    // description: Create new artifact
    // parameters: [projectId: Project ID]
    @Route(EMethod.POST, '/projects/:projectId/artifacts')
    public async createArtifact(key, item) {
        console.warn('[API] Create Artifact', key);
        await this._prepareArtifact(item);
        return await this.model.createArtifact(item, key.projectId);
    }

    // @OA:route
    // description: Update existing artifact
    @Route(EMethod.PUT, '/artifacts/:artifact')
    public async updateArtifact(key, item) {
        console.warn('[API] Update Artifact', key);
        await this._prepareArtifact(item);
        return await this.model.updateArtifact(item);
    }


    // @OA:route
    // description: Delete artifact by its ID
    @Route(EMethod.DELETE, '/artifacts/:artifactId')
    public async deleteArtifact(key) {
        console.warn('[API] Delete Artifact', key);
        await this.model.deleteArtifact(key.artifactId);
        return { deleted: true };
    }
}
