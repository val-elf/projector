import { DbBridge, DbModel } from "../core/db-bridge";
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { ITimeline, ITimespot, IUser } from './models/db.models';
import { TObjectId } from '../core/models';
import { PermissionsCheck } from './decorators/permissions-check';

@DbModel({ model: 'timelines' })
export class Timelines extends DbObjectAncestor<ITimeline> {
	private timespots = DbBridge.getBridge<ITimespot>('timespots');

	@PermissionsCheck({ permissions: [] })
	public async getProjectTimelines(projectId: TObjectId) {
		return await this.model.find({_project: projectId});
	}

	@PermissionsCheck({ permissions: [] })
	public async getTimeline(timelineId: TObjectId) {
		const timeline = await this.model.getItem(timelineId);
		const timespots = await this.timespots.find({ _timeline: timelineId });
		timeline.timespots = timespots;
		return timeline;
	}

	@PermissionsCheck({ permissions: [] })
	public async create(timeline: ITimeline, user?: IUser) {
		const timespots = timeline.timespots || [];
		delete timeline.timespots;

		// const user = await this.app.getCurrentUser();
		timeline = DbObjectController.normalize(timeline, user);
		const created = await this.model.create(timeline);
		created.timespots = await Promise.all(timespots.map(timespot => {
			timespot._timeline = created._id;
			return this.timespots.create(DbObjectController.normalize(timespot, user));
		}));
		return created;
	}

	@PermissionsCheck({ permissions: [] })
	public async update(timelines: ITimeline[], user?: IUser) {
		return await Promise.all(timelines
			.map<ITimeline>(item => DbObjectController.normalize(item, user))
			.map(tl => {
				delete tl.timespots;
				return this.model.updateItem(tl);
			}));
	}

	@PermissionsCheck({ permissions: [] })
	public async deleteTimeline(timelineId, user?: IUser) {
		return await this.deleteItem(timelineId, user);
	}
};