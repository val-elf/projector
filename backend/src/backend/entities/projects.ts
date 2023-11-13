import { DbBridge, DbModel } from '../core';
import { CategorySchemas } from './category-schema';
import { DbObjectAncestor } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';
import { IInitProject, IPreviewed, IProject, IUser } from './models';

type TProjectUpdate = Partial<IInitProject> & Partial<IPreviewed>;

@DbModel({
	model: 'projects',
})
export class Projects extends DbObjectAncestor<IProject, TProjectUpdate> {

	private get schemaManager() {
		return DbBridge.getInstance<CategorySchemas>('category-schemas');
	}

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