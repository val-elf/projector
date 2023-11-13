import { Route, Router, EMethod } from '~/network';
import { Timelines } from '../backend';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { ITimeline, ITimespot } from '~/backend/entities/models';

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
	// security: [APIKeyHeader:[]]
	// description: Get list of timelines
	// parameters: [projectId: Project ID]
	// responses: [200: List of timelines]
	@Route(EMethod.GET, '/projects/:projectId/timelines')
	public async getProjectTimelines(key): Promise<ITimeline[]> {
		console.warn('[API] Get project ', key.project);
		return await this.model.getProjectTimelines(key.project);
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Create new timeline
	// parameters: [projectId: Project ID]
	// requestBody: [item: ITimeline]
	// responses: [200: Timeline instance]
	@Route(EMethod.POST, '/projects/:projectId/timelines')
	public async createTimeline(key, timeline: ITimeline & { timespots?: ITimespot[] }): Promise<ITimeline> {
		console.warn('[API] Create new timeline', key);
		return await this.model.create(key.projectId, timeline);
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Update timeline
	// requestBody: [item: ITimeline]
	// responses: [200: Timeline instance]
	@Route(EMethod.PUT, '/timelines')
	public async updateTimeline(key, tlines: ITimeline | ITimeline[]): Promise<ITimeline | ITimeline[]> {
		console.warn('[API] Update Timeline', key);
		if(!(tlines instanceof Array)) tlines = [tlines];
		const timelines = await this.model.update(tlines);
		return timelines.length > 1 ? timelines : timelines[0];
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Get timeline
	// parameters: [timelineId: Timeline ID]
	// responses: [200: Timeline instance]
	@Route(EMethod.GET, '/timelines/:timelineId')
	public async getTimeline(key): Promise<ITimeline> {
		console.warn('[API] Get Timeline', key);
		return await this.model.getTimeline(key.timelineId);
	}

	// @OA:route
	// security: [APIKeyHeader:[]]
	// description: Delete timeline
	// parameters: [timelineId: Timeline ID]
	// responses: [200: Deleted timeline flag]
	@Route(EMethod.DELETE, '/timelines/:timelineId')
	public async deleteTimeline(key): Promise<{ delete: boolean }> {
		await this.model.deleteTimeline(key.timelineId);
		return { delete: true };
	}
}
