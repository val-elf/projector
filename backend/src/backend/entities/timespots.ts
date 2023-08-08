import { DbModel } from '../core';
import { DbObjectAncestor } from './dbbase';
import { DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { ITimespot, IUser } from './models';

@DbModel({ model: 'timespots' })
export class Timespots extends DbObjectAncestor<ITimespot> {

	@PermissionsCheck({ permissions: [] })
	public async update(timespotId: string, timespot: ITimespot) {
		if (timespotId !== timespot._id) {
			throw new Error('Timespot ID does not match');
		}
		return this.model.updateItem(timespot);
	}

	public async findByOwner(ownerId) {
		this.setOwners([ownerId]);
		return this.model.find()[0];
	}

	@PermissionsCheck({ permissions: [] })
	public async createTimespot(timelineId, timespot) {
		this.setOwners([timelineId]);
		return this.model.create(timespot);
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteTimespot(timespotId) {
		// const user = await this.app.getCurrentUser()
		return this.deleteItem(timespotId);
	}
}