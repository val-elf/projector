import { DbModel } from '../core/db-bridge';
import { TObjectId } from '../core/models';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { ILocation, IMetadata, IUser } from './models/db.models';
import { objId } from './utils';

@DbModel({ model: 'locations' })
export class Locations extends DbObjectAncestor<ILocation> {

	@PermissionsCheck({ permissions: [] })
	public async getLocationsList(projectId: TObjectId, metadata: IMetadata) {
		/*if(metadata.orderByType && (metadata.orderByType as string[]).length){
			return this.model.eval((projectId: string, orderByType: string[]) => {
				return db.locations.find({
					_project: new objId(projectId),
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

	@PermissionsCheck({ permissions: [] })
	public async getLocationItem(locationId) {
		return await this.model.find({_id: locationId});
	}

	@PermissionsCheck({ permissions: [] })
	public async createLocation(item: ILocation, user?: IUser) {
		const nitem = DbObjectController.normalize(item, user);
		return this.model.create(nitem);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateLocation(item: ILocation, user?: IUser) {
		item = DbObjectController.normalize(item, user);
		return this.model.updateItem(item);
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteLocation(itemId, user?: IUser) {
		return this.deleteItem(itemId, user);
	}
}
