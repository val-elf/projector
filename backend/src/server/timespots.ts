import { Timespots } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';

export class TimespotsRouter implements IRouter {
	model: Timespots;

	configure(app: Service) {
		this.model = new Timespots(app);
		app.for(this.model)
			.put('/timespots/:timespot', this.updateTimespot)
			.post('/timespots', this.createTimespot)
			.delete('/timespots/:timespot', this.deleteTimespot)
		;
	}

	updateTimespot = async (key, timespot) => {
		console.warn("[API] Update timespot", key);
		return this.model.update(timespot);
	}

	createTimespot = async (key, timespot) => {
		console.warn("[API] Create single timespot", key);
		return await this.model.createTimespot(timespot)
	}

	deleteTimespot = async (key) => {
		console.warn("[API] Delete timespot", key.timespotId);
		await this.model.deleteTimespot(key.timespot);
		return { delete: true };
	}
}
