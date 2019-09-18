const { CommonEntity, Core } = require('./core');
const tsModel = Core.getModel('timespots');

module.exports = class Timespots extends CommonEntity {
	async update(timespot) {
		const user = this.app.getCurrentUser();
		timespot = Core.normalize(timespot, user);
		timespot.$unset = {}
		if(timespot.endOffsetX === null){
			delete timespot.endOffsetX;
			timespot.$unset.endOffsetX = "";
		}
		if(!Object.keys(timespot.$unset).length) delete timespot.$unset;
		return tsModel.updateItem(timespot);
	}

	async createTimespot(timespot) {
		const user = await this.app.getCurrentUser();
		timespot = Core.normalize(timespot, user);
		return tsModel.create(timespot);
	}

	async deleteTimespot(timespotId) {
		const user = await this.app.getCurrentUser()
		return tsModel.deleteItem(timespotId, user);
	}
}