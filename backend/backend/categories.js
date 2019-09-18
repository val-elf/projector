const { Core, CommonEntity } = require('./core');
const catModel = Core.getModel("categories");

module.exports = class Categories extends CommonEntity {
	async createCategory(category, ownerId){
		const user = await this.app.getCurrentUser(true);
		category._owner = ownerId;
		category = Core.normalize(category, user);
		return await catModel.create(category);
	}

	async getOwnerCategories(owner) {
		await this.app.getCurrentUser(true);
		return catModel.find({_owner: owner});
	}

	updateCategory() {

	}
}