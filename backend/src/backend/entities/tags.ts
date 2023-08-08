import { DbBridge, DbModel } from '../core';
import { TFindList, TObjectId } from '../core/models';
import { DbObjectAncestor } from './dbbase';
import { DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { ITag } from './models/tag.model';

@DbModel({
    model: 'tags'
})
export class Tags extends DbObjectAncestor<ITag> {

    db = DbBridge.getInstance('dbobjects') as DbObjectController;

    @PermissionsCheck({ permissions: [] })
    public async getTagsList(ownerId: TObjectId) {
        this.setOwners(ownerId);
        return (await this.model.findList() as TFindList<ITag>).result;
    }

    @PermissionsCheck({ permissions: [] })
    public async getTagsListByNames(ownerIds: TObjectId[], names: string[]) {
        this.setOwners(ownerIds);
        return (await this.model.findList({ name: { $in: names } }) as TFindList<ITag>).result;
    }

    @PermissionsCheck({ permissions: [] })
    public async createTagsBundle(ownerIds: TObjectId[], names: string[]) {
        const res = [];
        for await(const name of names) {
            this.setOwners(ownerIds);
            const newTag = await this.model.create({
                name,
            });
            res.push(newTag);
        }
        return res;
    }

    @PermissionsCheck({ permissions: [] })
    public async getTagsForObjects(dbObjectIds: TObjectId[]) {
        const tagOwners = await this.db.getObjectsByIds(dbObjectIds);
        const tagIds = tagOwners.flatMap(tagOwner => tagOwner._tags);
        return (await this.model.find({ _id: { $in: tagIds } })).map(tag => tag.name);
    }

    @PermissionsCheck({ permissions: [] })
    public async searchObjects(projectId: string, search: string) {
        const tags = await this.model.find({ name: { $regex: search } });
        const tagIds = tags.map(tag => tag._id);
        return await this.db.getObjectsWithTags(tagIds, projectId);
    }
}