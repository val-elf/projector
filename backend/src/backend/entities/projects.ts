import { DbModel } from '../core/db-bridge';
import { DbObjectAncestor, DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { IProject, IUser } from './models/db.models';


@DbModel({ model: 'projects' })
export class Projects extends DbObjectAncestor<IProject> {

	@PermissionsCheck({ permissions: [] })
	public async getProjects(metadata, user?: IUser) {
		const meta = {
			sort: {'_update._dt': -1},
			...metadata
		};
		return await this.model.findList({'_create._user': user._id }, { 'preview.preview': 0 }, meta);
	}

	@PermissionsCheck({ permissions: [] })
	public async getProject(projectId) {
		return this.model.getItem({_id: projectId});
	}

	@PermissionsCheck({ permissions: [] })
	public async createProject(project, user?: IUser) {
		const _project = DbObjectController.normalize(project, user);
		return this.model.create(_project);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateProject(project: IProject, user?: IUser) {
		const _project = DbObjectController.normalize(project, user);
		return this.model.updateItem(_project);
	}
};