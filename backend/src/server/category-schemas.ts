import { IRouter } from '~/backend/core/models';
import { CategorySchemas } from '~/backend';
import { ICategorySchema, IHierarchyCategorySchemaItem, IInitCategorySchema } from '~/backend/entities/models/category-schema';
import { EMethod, Route, Service } from '~/network';
import { Router } from '~/network';

// @OA:tag
// name: CategorySchemas
// description: Project's category schemas management API
@Router()
export class CategorySchemasRouter implements IRouter{
    public model: CategorySchemas;

    configure(app: Service) {
        this.model = new CategorySchemas(app);
    }

    // @OA:route
    // description: Create root category schema
    // security: [APIKeyHeader: []]
    // requestBody: [categorySchema]
    // responses: [200: Return of the category schema]
    @Route(EMethod.POST, '/category-schemas')
    async createCategorySchema(key: any, categorySchema: Omit<IInitCategorySchema, '_id'>) {
        console.warn('[API] Create root category schema item', key);
        return await this.model.createCategorySchema(categorySchema);
    }

    // @OA:route
    // description: Create root category schema
    // security: [APIKeyHeader: []]
    // parameters: [ownerId: Id of the owner or null when schema is root]
    // requestBody: [categorySchema]
    // responses: [200: Return of the category schema]
    @Route(EMethod.POST, '/category-schemas/:ownerId')
    async createOwnerCategorySchema(key: any, categorySchema: Omit<IInitCategorySchema, '_id'>) {
        console.warn('[API] Create owned category schema item', key);
        return await this.model.createCategorySchema(categorySchema, key.ownerId);
    }

    // @OA:route
    // description: Get root category schemas
    // security: [APIKeyHeader: []]
    // responses: [200: Return of the category schemas]
    @Route(EMethod.GET, '/category-schemas')
    async getRootCategorySchemas(key: any): Promise<ICategorySchema[]> {
        console.warn('[API] Get root category schema item', key);
        return await this.model.getCategorySchemas();
    }

    // @OA:route
    // description: Get owner category schemas
    // security: [APIKeyHeader: []]
    // parameters: [ownerId: Id of the owner]
    // responses: [200: Return of the category schemas]
    @Route(EMethod.GET, '/category-schemas/:ownerId')
    async getOwnerCategorySchemas(key: any): Promise<ICategorySchema[]> {
        console.warn('[API] Get owned category schema item', key);
        return await this.model.getCategorySchemas(key.ownerId);
    }

    // @OA:route
    // description: Get category schemas hierarchy
    // security: [APIKeyHeader: []]
    // responses: [200: Return of the category schemas]
    @Route(EMethod.GET, '/category-schemas-hierarchy')
    async getCategorySchemasHierarchy(key: any): Promise<IHierarchyCategorySchemaItem[]> {
        console.warn('[API] Get owned category schema item', key);
        return await this.model.getCategorySchemasHierarchy();
    }

    // @OA:route
    // description: Assign category schema to project
    // security: [APIKeyHeader: []]
    // parameters: [projectId: Id of the project, categorySchemaId: Id of the category schema]
    // responses: [200: Return of the category schemas]
    @Route(EMethod.POST, '/category-schemas/:categorySchemaId/assignTo/:projectId')
    async assignCategorySchema(key: any): Promise<{ updated: boolean }> {
        console.warn('[API] Assign existing schema item to Project', key);
        // const categorySchema = await this.model.getCategorySchema(key.categorySchemaId);
        const success = await this.model.assignProjectToSchema(key.categorySchemaId, key.projectId);
        return { updated: success };
    }

    // @OA:route
    // security: [APIKeyHeader:[]]
    // description: Get project schema
    // parameters: [projectId: Project ID]
    // responses: [200: Project schema instance]
    @Route(EMethod.GET, '/projects/:projectId/schema')
    async getProjectSchema(key): Promise<IHierarchyCategorySchemaItem> {
        console.warn('[API] Get schema for project', key);
        return await this.model.getProjectSchema(key.projectId);
    }

}