import { Route, Router, EMethod } from '~/network';
import { Timelines } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { ITimeline, ITimespot } from '~/backend/entities/models';

/**
 * @openapi
 * tags:
 *   name: Timelines
 *   description: Project's timelines management API
 */
// @OA:tag
// name: Timelines
// description: Project's timelines management API
@Router()
export class TimelinesRouter implements IRouter {
	model: Timelines;
	private app: Service;

	configure(app: Service) {
		this.model = new Timelines(app);
		this.app = app;
	}

	// @OA:route
	// description: Get list of timelines
	@Route(EMethod.GET, '/projects/:projectId/timelines')
	public async getProjectTimelines(key) {
		console.warn('[API] Get project ', key.project);
		const list = await this.model.getProjectTimelines(key.project);
		this.app.response.set(list);
	}

	// @OA:route
	// description: Create new timeline
	@Route(EMethod.POST, '/projects/:projectId/timelines')
	public async createTimeline(key, timeline: ITimeline & { timespots?: ITimespot[] }) {
		console.warn('[API] Create new timeline', key);
		return await this.model.create(key.projectId, timeline);
	}

	// @OA:route
	// description: Update timeline
	@Route(EMethod.PUT, '/timelines')
	public async updateTimeline(key, tlines) {
		console.warn('[API] Update Timeline', key);
		if(!(tlines instanceof Array)) tlines = [tlines];
		const timelines = await this.model.update(tlines);
		return timelines.length > 1 ? timelines : timelines[0];
	}

	// @OA:route
	// description: Get timeline
	@Route(EMethod.GET, '/timelines/:timelineId')
	public async getTimeline(key) {
		console.warn('[API] Get Timeline', key);
		return await this.model.getTimeline(key.timelineId);
	}

	// @OA:route
	// description: Delete timeline
	@Route(EMethod.DELETE, '/timelines/:timelineId')
	public async deleteTimeline(key) {
		await this.model.deleteTimeline(key.timelineId);
		return { delete: true };
	}
}
