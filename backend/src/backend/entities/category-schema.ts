import { DbBridge, DbModel } from '../core';
import { TObjectId } from '../core/models';
import { DbObjectAncestor } from './dbbase';
import { PermissionsCheck } from './decorators/permissions-check';
import { IProject } from './models';
import { ICategorySchema, IHierarchyCategorySchemaItem, IInitCategorySchema } from './models/category-schema';
import { Projects } from './projects';


@DbModel({ model: 'category-schemas' })
export class CategorySchemas extends DbObjectAncestor<ICategorySchema, IInitCategorySchema> {
    get projectManager() {
        return DbBridge.getInstance<Projects>('projects');
    }

    @PermissionsCheck({ permissions: [] })
    public async createCategorySchema(categorySchema: IInitCategorySchema, ownerId?: TObjectId) {
        if (ownerId) this.setOwners([ownerId]);
        return await this.model.create(categorySchema);
    }

    @PermissionsCheck({ permissions: [] })
    public async getCategorySchemas(ownerId?: TObjectId): Promise<ICategorySchema[]> {
        this.setOwners({ id: ownerId, type: this.model.modelName });
        console.log('Getting categories for base:', ownerId);
        return await this.model.find({});
    }

    @PermissionsCheck({ permissions: [] })
    public async getCategorySchema(schemaId: TObjectId): Promise<ICategorySchema> {
        return await this.model.getItem(schemaId);
    }

    @PermissionsCheck({ permissions: [] })
    public async assignProjectToSchema(schemaId: TObjectId, projectId: TObjectId): Promise<boolean> {
        const schema = await this.model.getItem(schemaId);
        if (schema) {
            const project = await this.projectManager.getProject(projectId) as Partial<IProject>;
            if (project) {
                const settings = project.settings ?? {};
                Object.assign(settings, {
                    _schema: schemaId
                });
                project.settings = settings;
                const { preview, ...updated } = project;
                await this.projectManager.updateProject(updated);
                return true;
            }
        }
        return false;
        //return await this.createCategorySchema(schema, projectId);
    }

    @PermissionsCheck({ permissions: [] })
    public async getCategorySchemasHierarchy(categorySchema?: IInitCategorySchema): Promise<IHierarchyCategorySchemaItem[]> {
        const items = await this.getCategorySchemas(categorySchema?._id);
        let result = await Promise.all(items.map(async (item) => {
            await this.getCategorySchemasHierarchy(item);
            return item;
        }));
        if (categorySchema && result.length) {
            Object.assign(categorySchema, {
                children: result
            });
            return [categorySchema as IHierarchyCategorySchemaItem];
        }
        return result;
    }

	@PermissionsCheck({ permissions: [] })
	public async getProjectSchema(projectId: string) {
		const project = await this.projectManager.getProject(projectId);
		if (!project?.settings?._schema) return;
		const schema = await this.getCategorySchema(project.settings._schema);
		if (!schema) return;
		return (await this.getCategorySchemasHierarchy(schema))?.[0];
	}

}