import { DbModel } from '../core';
import { DbObjectAncestor } from './dbbase';
import { DbObjectController } from './dbobjects';
import { PermissionsCheck } from './decorators/permissions-check';
import { IProject, IUser } from './models';

@DbModel({
	model: 'projects',
})
export class Projects extends DbObjectAncestor<IProject> {

	@PermissionsCheck({ permissions: [] })
	public async getProjects(metadata: any, user?: IUser) {
		metadata = {
			sort: { '_updated._dt': -1 },
			...metadata,
		};
		this.setOwners([user._id]);
		return await this.model.findList(undefined, { 'preview.preview': 0 }, metadata);
	}

	@PermissionsCheck({ permissions: [] })
	public async getProject(projectId) {
		return this.model.getItem(projectId);
	}

	@PermissionsCheck({ permissions: [] })
	public async createProject(project) {
		return this.model.create(project);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateProject(project: IProject) {
		return this.model.updateItem(project);
	}
};