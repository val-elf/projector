import { DbBridge, DbModel } from '../core';
import { TObjectId } from '../core/models';
import { IDbObject } from './models';
import { DbObjectBase } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';

@DbModel({ model: 'dbobjects' })
export class DbObjectController extends DbObjectBase<IDbObject, IDbObject> {
	readonly model: DbBridge<IDbObject, IDbObject>

	@PermissionsCheck({ permissions: [] })
	public async getDbObject(itemId: TObjectId) {
		return await this.model.getItem(itemId);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateItem(item: IDbObject) {
		return await this.model.updateItem(item);
	}

	@PermissionsCheck({ permissions: [] })
	public async getObjectsByIds(ids: TObjectId[]) {
		return await this.model.find({ _id: { $in: ids } });
	}

	@PermissionsCheck({ permissions: [] })
	public async getObjectsWithTags(tagIds: TObjectId[], projectId?: TObjectId) {
		let query: any = { _tags: { $in: tagIds } };
		if (projectId) {
			Object.assign(query,
				{ $or: [ { _owners: { $in: [projectId] } }, { _id: projectId } ] }
			);
		}
		query = this.fixIds(query) as Object;
        console.log('Search for tags:', query['$or']);
		return await this.model.find(this.fixIds(query));
	}
}

