import { IRouter } from '~/backend/core/models';
import { Tags } from '~/backend/entities/tags';
import { EMethod, Route, Router, Service } from '~/network';
import { IKeyMap } from './models';

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
    // description: Get project's tags list
    @Route(EMethod.GET, '/projects/:projectId/tags')
    public async getProjectTags(key) {
        console.warn('[API] Get project tags', key.projectId);
        return await this.model.getTagsList(key.projectId);
    }

    // @OA:route
    // description: Get object's tags list
    @Route(EMethod.GET, '/dbobject/:objectId/tags')
    public async getObjectTags(key: IKeyMap) {
        return await this.model.getTagsForObjects([key.objectId]);
    }

    // @OA:route
    // description: Search objects by tag
    @Route(EMethod.GET, '/projects/:projectId/searchByTag')
    public async searchObjectsByTags(key: IKeyMap) {
        return await this.model.searchObjects(key.projectId, key._metadata.search);
    }

}