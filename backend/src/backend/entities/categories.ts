import { DbModel } from '../core';
import { TObjectId } from '../core/models';
import { DbObjectAncestor } from './dbbase';
import { DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { ICategory, IDbObject, IUser } from './models';

@DbModel({ model: "categories" })
export class Categories extends DbObjectAncestor<ICategory> {

	@PermissionsCheck({ permissions: [] })
	public async createCategory(category: ICategory, ownerId: TObjectId, user?: IUser){
		this.setOwners([ownerId]);
		return await this.model.create(category);
	}

	@PermissionsCheck({ permissions: [] })
	public async getOwnerCategories(owner: IDbObject) {
		return this.model.find({_owner: owner});
	}

	@PermissionsCheck({ permissions: [] })
	public updateCategory(category: ICategory) {

	}
}