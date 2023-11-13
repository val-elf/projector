import { IRouter } from '~/backend/core/models';
import { Tags } from '~/backend/entities/tags';
import { EMethod, Route, Router, Service } from '~/network';
import { IKeyMap } from './models';
import { ITag } from '~/backend/entities/models/tag.model';
import { IDbObject } from '~/backend/entities/models';

// @OA:tag
// name: Tags
// description: Project's tags management API
@Router()
export class TagsRouter implements IRouter {
    model: Tags;

    configure(app: Service) {
        this.model = new Tags(app);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Get project's tags list
    // parameters: [projectId: Project ID]
    // responses: [200: List of tags]
    @Route(EMethod.GET, '/projects/:projectId/tags')
    public async getProjectTags(key: IKeyMap): Promise<ITag[]> {
        console.warn('[API] Get project tags', key.projectId);
        return await this.model.getTagsList(key.projectId);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Get object's tags list
    // parameters: [objectId: Object ID]
    // responses: [200: List of values of tags]
    @Route(EMethod.GET, '/dbobject/:objectId/tags')
    public async getObjectTags(key: IKeyMap): Promise<string[]> {
        return await this.model.getTagsForObjects([key.objectId]);
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Search objects by tag
    // parameters: [projectId: Project ID]
    // responses: [200: List of dbobjects by tags]
    @Route(EMethod.GET, '/projects/:projectId/searchByTag')
    public async searchObjectsByTags(key: IKeyMap): Promise<IDbObject[]> {
        return await this.model.searchObjects(key.projectId, key._metadata.search);
    }

}