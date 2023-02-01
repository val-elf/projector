import { DbModel } from '../core/db-bridge';
import { DbObjectAncestor } from './dbobjects';
import { ITimespot } from './models/db.models';

@DbModel({ model: 'timespots' })
export class Timespots extends DbObjectAncestor<ITimespot> {
	async update(timespot) {
		// const user = this.app.getCurrentUser();
		timespot = this.dbObject.normalize(timespot);
		timespot.$unset = {}
		if(timespot.endOffsetX === null){
			delete timespot.endOffsetX;
			timespot.$unset.endOffsetX = "";
		}
		if(!Object.keys(timespot.$unset).length) delete timespot.$unset;
		return this.model.updateItem(timespot);
	}

	async createTimespot(timespot) {
		// const user = await this.app.getCurrentUser();
		timespot = this.dbObject.normalize(timespot);
		return this.model.create(timespot);
	}

	async deleteTimespot(timespotId) {
		// const user = await this.app.getCurrentUser()
		return this.deleteItem(timespotId);
	}
}