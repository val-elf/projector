import { DbModel } from '../core/db-bridge';
import { DbObjectAncestor } from './dbobjects';
import { ILocation } from './models/db.models';

@DbModel({ model: 'locations' })
export class Locations extends DbObjectAncestor<ILocation> {
	async getLocationsList(projectId, metadata) {
		// await this.app.getCurrentUser();
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
		return await this.model.findList({_project: projectId}, metadata);
	}

	async getLocationItem(locationId) {
		// await this.app.getCurrentUser();
		return await this.model.find({_id: locationId});
	}

	async createLocation(item) {
		// const user = await this.app.getCurrentUser();
		const nitem = this.dbObject.normalize(item);
		return this.model.create(nitem);
	}

	async updateLocation(item: ILocation) {
		// const user = await this.app.getCurrentUser();
		// item = DbModel.normalize(item, user);
		return this.model.updateItem(item);
	}

	async deleteLocation(itemId) {
		// const user =  this.app.getCurrentUser();
		return this.deleteItem(itemId);
	}
}
