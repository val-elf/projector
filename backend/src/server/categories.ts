import { Service } from '../network/service';
import { Categories } from '../backend/entities/categories';
import { IRouter } from '../backend/core/models';
import { ICategory } from '~/backend/entities/models';
import { EMethod, Route, Router } from '~/network';

// @OA:tag
// name: Categories
// description: Categories management API
@Router()
export class CategoriesRouter implements IRouter {
	model: Categories;

	public configure(app: Service) {
		this.model = new Categories(app);
	}

	// @OA:route
	// description: Get count of categories
	@Route(EMethod.GET, '/owner/:ownerId/categories/')
	public async getOwnerCategories(key) {
		console.warn('[API] Get owner Categories', key);
		return await this.model.getOwnerCategories(key.ownerId);
	}

	// @OA:route
	// description: Get count of categories
	@Route(EMethod.POST, '/owner/:ownerId/categories/')
	public async createCategory(key, category: ICategory) {
		console.warn('[API] Create Category', key);
		return await this.model.createCategory(category, key.ownerId);
	}

	// @OA:route
	// description: Get count of categories
	@Route(EMethod.PUT, '/owner/:ownerId/categories/:categoryId')
	public async updateCategory(key, category: ICategory) {
		console.warn('[API] Update Category', key);
		return await this.model.updateCategory(category);
	}
}
