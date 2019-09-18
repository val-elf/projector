const { CommonEntity, Core } = require('./core');
const locModel = Core.getModel('locations');

module.exports = class Locations extends CommonEntity {
	async getLocationsList(projectId, metadata) {
		await this.app.getCurrentUser();
		/*if(metadata.orderByType && metadata.orderByType.length){
			return locModel.eval((projectId, orderByType) => {
				return db.locations.find({
					_project: ObjectId(projectId),
					_deleted: {$exists: false}
				}).map(function(item){
					item._loctype = orderByType.indexOf(item.locationType);
					if(item._loctype === -1) item._loctype = 1000;
					return item;
				}).sort(function(i1, i2){
					return i1._loctype - i2._loctype;
				});
			}, [projectId, metadata.orderByType]);
		}*/
		return locModel.findList({_project: projectId}, metadata);
	}

	async getLocationItem(locationId) {
		await this.app.getCurrentUser();
		return locModel.find({_id: locationId});
	}

	async createLocation(item) {
		const user = await this.app.getCurrentUser();
		item = Core.normalize(item, user);
		return locModel.create(item);
	}

	async updateLocation(item) {
		const user = await this.app.getCurrentUser();
		item = Core.normalize(item, user);
		return locModel.updateItem(item);
	}

	async deleteLocation(itemId) {
		const user =  this.app.getCurrentUser();
		return locModel.deleteItem(itemId, user);
	}
}