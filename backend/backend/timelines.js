const { CommonEntity, Core } = require("./core");
const timelineModel = Core.getModel("timelines");
const timespotsModel = Core.getModel("timespots");

module.exports = class Timelines extends CommonEntity {
	async getProjectTimelines(projectId) {
		return await timelineModel.find({_project: projectId});
	}

	async getTimeline(timelineId) {
		const timeline = await timelineModel.getItem(timelineId);
		const timespots = await timespotsModel.find({ _timeline: timelineId });
		timeline.timespots = timespots;
		return timeline;
	}

	async create(timeline) {
		var timespots = timeline.timespots || [];
		delete timeline.timespots;

		const user = await this.app.getCurrentUser();
		timeline = Core.normalize(timeline, user);
		const created = await timelineModel.create(timeline);
		created.timespots = await Promise.all(timespots.map(timespot => {
			timespot._timeline = created._id;
			return timespotsModel.create(Core.normalize(timespot, user));
		}));
		return created;
	}

	async update(timelines) {
		const user = await this.app.getCurrentUser();
		return await Promise.all(timelines.map(tl => {
			tl = Core.normalize(tl, user);
			delete tl.timespots;
			return timelineModel.updateItem(tl);
		}));
	}

	async deleteTimeline(timelineId) {
		const user = await this.app.getCurrentUser(true);
		return await timelineModel.deleteItem(timelineId, user);
	}
};