const { Core, CommonEntity} = require("./core");
const projectModel = Core.getModel("projects");

module.exports = class Projects extends CommonEntity {
	async getProjects(metadata) {
		var meta = Object.assign({
			sort: {'_update._dt': -1}
		}, metadata);
		const user = await this.app.getCurrentUser();
		const projects = await projectModel.findList({'_create._user': user._id }, { 'preview.preview': 0 }, meta);
		return projects;
	}

	async getProject(projectId) {
		await this.app.getCurrentUser();
		return projectModel.getItem({_id: projectId});
	}

	async createProject(project) {
		await this.app.getCurrentUser();
		project = Core.normalize(project, user);
		return projectModel.create(project);
	}

	async updateProject(project) {
		const user = await this.app.getCurrentUser();
		project = Core.normalize(project, user);
		return projectModel.updateItem(project);
	}
};