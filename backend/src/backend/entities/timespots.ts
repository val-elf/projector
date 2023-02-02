import { DbModel } from '../core/db-bridge';
import { DbObjectAncestor, DbObjectBase, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { ITimespot, IUser } from './models/db.models';

@DbModel({ model: 'timespots' })
export class Timespots extends DbObjectAncestor<ITimespot> {

	@PermissionsCheck({ permissions: [] })
	public async update(timespot, user?: IUser) {
		// const user = this.app.getCurrentUser();
		timespot = DbObjectController.normalize(timespot, user);
		timespot.$unset = {}
		if(timespot.endOffsetX === null){
			delete timespot.endOffsetX;
			timespot.$unset.endOffsetX = "";
		}
		if(!Object.keys(timespot.$unset).length) delete timespot.$unset;
		return this.model.updateItem(timespot);
	}

	@PermissionsCheck({ permissions: [] })
	public async createTimespot(timespot, user?: IUser) {
		timespot = DbObjectController.normalize(timespot, user);
		return this.model.create(timespot);
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteTimespot(timespotId, user?: IUser) {
		// const user = await this.app.getCurrentUser()
		return this.deleteItem(timespotId, user);
	}
}