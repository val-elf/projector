import { DbBridge, DbModel } from "../core/db-bridge";
import { Timespots } from './timespots';
import { DbObjectAncestor } from './dbobjects';
import { ITimeline, ITimespot } from './models/db.models';
import { TObjectId } from '../core/models';

@DbModel({ model: 'timelines' })
export class Timelines extends DbObjectAncestor<ITimeline> {
	private timespots = DbBridge.getBridge<ITimespot>('timespots');

	async getProjectTimelines(projectId: TObjectId) {
		return await this.model.find({_project: projectId});
	}

	async getTimeline(timelineId: TObjectId) {
		const timeline = await this.model.getItem(timelineId);
		const timespots = await this.timespots.find({ _timeline: timelineId });
		timeline.timespots = timespots;
		return timeline;
	}

	async create(timeline: ITimeline) {
		const timespots = timeline.timespots || [];
		delete timeline.timespots;

		// const user = await this.app.getCurrentUser();
		timeline = this.dbObject.normalize(timeline);
		const created = await this.model.create(timeline);
		created.timespots = await Promise.all(timespots.map(timespot => {
			timespot._timeline = created._id;
			return this.timespots.create(this.dbObject.normalize(timespot));
		}));
		return created;
	}

	async update(timelines: ITimeline[]) {
		//const user = await this.app.getCurrentUser();
		return await Promise.all(timelines
			.map<ITimeline>(this.dbObject.normalize)
			.map(tl => {
				delete tl.timespots;
				return this.model.updateItem(tl);
			}));
	}

	async deleteTimeline(timelineId) {
		// const user = await this.app.getCurrentUser(true);
		return await this.deleteItem(timelineId);
	}
};