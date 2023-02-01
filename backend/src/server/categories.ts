import { Service } from '../network/service';
import { Categories } from '../backend/entities/categories';
import { IRouter } from '../backend/core/models';
import { ICategory } from '~/backend/entities/models/db.models';

export class CategoriesRouter implements IRouter {
	model: Categories;

	public configure(app: Service) {
		this.model = new Categories(app);
		app.for(this.model)
			.get('/owner/:owner/categories/', this.getOwnerCategories)
			.post('/owner/:owner/categories/', this.createCategory)
			.put('/owner/:owner/categories/:category', this.updateCategory)
		;
	}

	private getOwnerCategories = async (key) => {
		console.warn("[API] Get owner Categories", key);
		return await this.model.getOwnerCategories(key.owner);
	}

	private createCategory = async (key, category) => {
		console.warn("[API] Create Category", key);
		return await this.model.createCategory(category, key.owner);
	}

	private updateCategory = async (key, category: ICategory) => {
		console.warn("[API] Update Category", key);
		return await this.model.updateCategory(category);
	}
}
