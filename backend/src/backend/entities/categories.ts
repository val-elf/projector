import { DbModel } from '../core/db-bridge';
import { TObjectId } from '../core/models';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { ICategory, IDbObject, IUser } from './models/db.models';

@DbModel({ model: "categories" })
export class Categories extends DbObjectAncestor<ICategory> {

	@PermissionsCheck({ permissions: [] })
	async createCategory(category: ICategory, ownerId: TObjectId, user?: IUser){
		category._owner = ownerId;
		category = DbObjectController.normalize(category, user);
		return await this.model.create(category);
	}

	async getOwnerCategories(owner: IDbObject) {
		return this.model.find({_owner: owner});
	}

	@PermissionsCheck({ permissions: [] })
	updateCategory(category: ICategory) {

	}
}