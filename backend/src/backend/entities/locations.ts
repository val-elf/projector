import { utils } from '~/utils/utils';
import { DbModel } from '../core';
import { IFindList, TObjectId } from '../core/models';
import { DbObjectAncestor } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';
import { IInitLocation, ILocation, IMetadata, IPreviewed } from './models';

type TLocationUpdate = IInitLocation & Partial<IPreviewed>;

@DbModel({ model: 'locations' })
export class Locations extends DbObjectAncestor<ILocation, TLocationUpdate> {

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
		this.setOwners([projectId]);
		return (await this.model.findList(undefined, { 'preview.preview': 0 }, metadata)).result;
	}

	@PermissionsCheck({ permissions: [] })
	public async getLocationItem(locationId) {
		return (await this.model.find({_id: locationId}))[0];
	}

	@PermissionsCheck({ permissions: [] })
	public async createLocation(projectId: string, item: IInitLocation) {
		this.setOwners([projectId]);
		const location = await utils.preparePreview<TLocationUpdate>(item);
		return this.model.create(location);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateLocation(_id: string, item: IInitLocation) {
		if (item._id !== _id) throw new Error('Invalid location id');
		const location = await utils.preparePreview<TLocationUpdate>(item);
		return this.model.updateItem(location);
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteLocation(itemId) {
		return this.deleteItem(itemId);
	}
}
