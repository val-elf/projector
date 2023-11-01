import { DbModel } from '../core';
import { DbObjectAncestor } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';
import { IInitProject, IPreviewed, IProject, IUser } from './models';

type TProjectUpdate = IInitProject & Partial<IPreviewed>;

@DbModel({
	model: 'projects',
})
export class Projects extends DbObjectAncestor<IProject, IInitProject & Partial<IPreviewed>> {

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
	public async createProject(project: TProjectUpdate) {
		return this.model.create(project);
	}

	@PermissionsCheck({ permissions: [] })
	public async updateProject(project: TProjectUpdate) {
		return this.model.updateItem(project);
	}
};