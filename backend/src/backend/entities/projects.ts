import { DbModel } from '../core/db-bridge';
import { DbObjectAncestor } from './dbobjects';
import { IProject } from './models/db.models';


@DbModel({ model: 'projects' })
export class Projects extends DbObjectAncestor<IProject> {

	async getProjects(metadata) {
		const meta = Object.assign({
			sort: {'_update._dt': -1}
		}, metadata);
		// const user = await this.app.getCurrentUser();
		return await this.model.findList({'_create._user': this.user._id }, { 'preview.preview': 0 }, meta);
	}

	async getProject(projectId) {
		// await this.app.getCurrentUser();
		return this.model.getItem({_id: projectId});
	}

	async createProject(project) {
		// const user = await this.app.getCurrentUser();
		const _project = this.dbObject.normalize(project);
		return this.model.create(_project);
	}

	async updateProject(project) {
		// const user = await this.app.getCurrentUser();
		const _project = this.dbObject.normalize(project);
		return this.model.updateItem(_project);
	}
};