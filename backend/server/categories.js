const Categories = require('../backend/categories');

module.exports.configure = function(app){
	const categories = new Categories(app);
	app.for(categories)
		.get('/owner/:owner/categories/', getOwnerCategories)
		.post('/owner/:owner/categories/', createCategory)
		.put('/owner/:owner/categories/:category', updateCategory)
	;

}

async function getOwnerCategories(key){
	console.log("[API] Get owner Categories", key);
	return await this.model.getOwnerCategories(key.owner);
}

async function createCategory(key, category){
	console.log("[API] Create Category", key);
	return await this.model.createCategory(category, key.owner);
}

async function updateCategory(key, category){
	console.log("[API] Update Category", key);
	return await this.model.updateCategory(category);
}