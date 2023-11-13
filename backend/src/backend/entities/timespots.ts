import { DbModel } from '../core';
import { TObjectId } from '../core/models';
import { DbObjectAncestor } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';
import { IInitTimespot, ITimespot } from './models';

@DbModel({ model: 'timespots' })
export class Timespots extends DbObjectAncestor<ITimespot, IInitTimespot> {

	@PermissionsCheck({ permissions: [] })
	public async update(timespotId: TObjectId, timespot: IInitTimespot) {
		if (timespotId !== timespot._id) {
			throw new Error('Timespot ID does not match');
		}
		return this.model.updateItem(timespot);
	}

	public async findByOwner(ownerId: TObjectId) {
		this.setOwners([ownerId]);
		return this.model.find()[0];
	}

	@PermissionsCheck({ permissions: [] })
	public async createTimespot(timelineId: TObjectId, timespot: IInitTimespot) {
		this.setOwners([timelineId]);
		return this.model.create(timespot);
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteTimespot(timespotId: TObjectId) {
		// const user = await this.app.getCurrentUser()
		return this.deleteItem(timespotId);
	}
}