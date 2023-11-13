import { DbBridge, DbModel } from "../core";
import { IInitTimeline, ITimeline, ITimespot } from './models';
import { TObjectId } from '../core/models';
import { PermissionsCheck } from './decorators/permissions-check';
import { DbObjectAncestor } from './dbbase';
import { Timespots } from './timespots';

type TServerTimeline = IInitTimeline & { timespots?: ITimespot[] };

@DbModel({ model: 'timelines' })
export class Timelines extends DbObjectAncestor<ITimeline, IInitTimeline> {

	@PermissionsCheck({ permissions: [] })
	public async getProjectTimelines(projectId: TObjectId) {
		return await this.model.find(this.fixIds({_project: projectId}));
	}

	@PermissionsCheck({ permissions: [] })
	public async getTimeline(timelineId: TObjectId) {
		const timeline = { ...await this.model.getItem(timelineId) } as TServerTimeline;
		const timespotsModel = DbBridge.getInstance<Timespots>('timespots');
		const timespots = await timespotsModel.findByOwner(timelineId);
		timeline.timespots = timespots;
		return timeline;
	}

	@PermissionsCheck({ permissions: [] })
	public async create(projectId: string, timeline: TServerTimeline) {
		let { timespots } = timeline;
		delete timeline.timespots;
		const timespotsModel = DbBridge.getInstance<Timespots>('timespots');

		this.setOwners(projectId);
		const newTimeline: TServerTimeline = await this.model.create(timeline);

		for await (let timespot of timespots ?? []) {
			await timespotsModel.createTimespot(newTimeline._id, timespot);
		}

		return newTimeline;
	}

	@PermissionsCheck({ permissions: [] })
	public async update(timelines: TServerTimeline[]) {
		return await Promise.all(timelines
			.map(tl => {
				delete tl.timespots;
				return this.model.updateItem(tl);
			}));
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteTimeline(timelineId) {
		return await this.deleteItem(timelineId);
	}
};