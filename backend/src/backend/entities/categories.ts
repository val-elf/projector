import { DbModel } from '../core/db-bridge';
import { DbObjectAncestor } from './dbobjects';
import { ICategory } from './models/db.models';

@DbModel({ model: "categories" })
export class Categories extends DbObjectAncestor<ICategory> {
	async createCategory(category, ownerId){
		category._owner = ownerId;
		category = this.dbObject.normalize(category);
		return await this.model.create(category);
	}

	async getOwnerCategories(owner) {
		return this.model.find({_owner: owner});
	}

	updateCategory(category: ICategory) {

	}
}