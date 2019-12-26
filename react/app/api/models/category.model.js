import { Model, Type, Types, Service, ModelList } from '~/api/engine';
import { DefaultModel, OwnerModel, DbObjectsService } from "./default.model";

export class Category extends DefaultModel{
	name = new Type(Types.string);
	owner = new Type(DefaultModel, { parent: true, key: '_owner'});
	parent = new Type(DefaultModel, { key: '_parent'} );

	get Children() {
		if (!this.children) this.children = [];
		return this.children;
	}

	static config = {
		name: 'Category',
		url: 'categories'
	}
}

class TreeCategories extends ModelList {
	prepareTreeView() {
		const hash = {};
		const res = this.reduce((res, item) => {
			const { _parent: pid, _owner: oid } = item.__data;

			if(pid && pid !== oid) {
				const parent = hash[pid] || this.find(item => item.id === pid);
				if (parent) {
					parent.Children.push(item);
				}
			} else {
				res.push(item);
			}
			hash[item.id] = item;
			return res;
		}, []);
		return res;
	}
}

class CategoriesServiceBase extends Service {
	static get modelList() {
		return TreeCategories;
	}

	flatList(treeView) {
		const res = [];
		treeView.forEach(cat => {
			res.push(cat);
			if (cat.Children) {
				res.push(...this.flatList(cat.Children));
			}
		});
		return res;
	}
}

export const CategoriesService = CategoriesServiceBase.createServiceFor(Category, OwnerModel);

