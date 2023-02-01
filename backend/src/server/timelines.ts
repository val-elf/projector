import { Timelines } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';

export class TimelinesRouter implements IRouter {
	model: Timelines;
	private app: Service;

	configure(app: Service) {
		this.model = new Timelines(app);
		this.app = app;
		app.for(this.model)
			.get('/projects/:project/timelines', this.getProjectTimelines)
			.post('/projects/:project/timelines', this.createTimeline)
			.put('/projects/:project/timelines/:timeline', this.updateTimeline)
			.delete('/projects/:project/timelines/:timeline', this.deleteTimeline)
			.get('/projects/:project/timelines/:timeline', this.getTimeline)
		;
	}

	getProjectTimelines = async (key) => {
		console.warn("[API] Get project ", key.project);
		const list = await this.model.getProjectTimelines(key.project);
		this.app.response.set(list);
	}

	createTimeline = async (key, items) => {
		console.warn("[API] Create new timeline", key, items);
		var timeline = items;
		timeline._project = key.project;
		return await this.model.create(timeline);
	}

	updateTimeline = async (key, tlines) => {
		console.warn("[API] Update Timeline", key);
		if(!(tlines instanceof Array)) tlines = [tlines];
		const timelines = await this.model.update(tlines);
		return timelines.length > 1 ? timelines : timelines[0];
	}

	getTimeline = async (key) => {
		console.warn("[API] Get Timeline", key);
		return await this.model.getTimeline(key.timeline);
	}

	deleteTimeline = async (key) => {
		await this.model.deleteTimeline(key.timeline);
		return { delete: true };
	}
}

