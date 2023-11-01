import { Service } from '../network/service';
import { Categories } from '../backend/entities/categories';
import { IRouter } from '../backend/core/models';
import { ICategory, IInitCategory } from '~/backend/entities/models';
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
	// security: [ APIKeyHeader: []]
	// description: Get count of categories
	// parameters: [ownerId: Owner ID]
	// responses: [200: List of categories, 401: Bad request]
	@Route(EMethod.GET, '/owner/:ownerId/categories/')
	public async getOwnerCategories(key): Promise<ICategory[]> {
		console.warn('[API] Get owner Categories', key);
		return await this.model.getOwnerCategories(key.ownerId);
	}

	// @OA:route
	// security: [ APIKeyHeader: []]
	// description: Get count of categories
	// parameters: [ownerId: Owner ID]
	// requestBody: [item: IInitCategory]
	// responses: [200: Created Category Item, 401: Bad request]
	@Route(EMethod.POST, '/owner/:ownerId/categories/')
	public async createCategory(key, category: IInitCategory): Promise<ICategory> {
		console.warn('[API] Create Category', key);
		return await this.model.createCategory(category, key.ownerId);
	}

	// @OA:route
	// security: [ APIKeyHeader: []]
	// description: Get count of categories
	// parameters: [ownerId: Owner ID, categoryId: Category ID]
	// requestBody: [item: IInitCategory]
	// responses: [200: Updated Category Item, 401: Bad request]
	@Route(EMethod.PUT, '/owner/:ownerId/categories/:categoryId')
	public async updateCategory(key, category: IInitCategory): Promise<ICategory> {
		console.warn('[API] Update Category', key);
		return await this.model.updateCategory(category);
	}
}
