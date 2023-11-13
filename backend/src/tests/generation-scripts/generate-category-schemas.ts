import { ICategorySchema, IInitCategorySchema } from '~/backend/entities/models/category-schema';
import { core } from '../core';
import { IGenerationScript } from '../model';
import { utils } from '../utils';
import { GenerateProjects } from './generate-projects';
import { TObjectId } from '~/backend/core/models';

export class GenerateCategorySchemas implements IGenerationScript {

    public async *generate() {
        // const projects = await GenerateProjects.getRandomProjects(10);
        // const projectIds = projects.map(p => p._id);

        // generate new characters
        await this.generateCategorySchemas();

        const rootCategorySchemas = (await core.get(`/category-schemas`)) as ICategorySchema[];

        // generate inner category schemas
        for await(const categorySchema of rootCategorySchemas) {
            const levels = Math.round(Math.random() * 2) + 1;
            console.log('Levels for', categorySchema._id, levels);
            await this.generateInnerCategorySchemas(categorySchema, levels);
            // const workCategorySchema = rootCategorySchema;
        }

        yield true;
    }

    private async generateInnerCategorySchemas(categorySchema: ICategorySchema, levels: number) {
        if (levels <= 0) return;
        await this.generateCategorySchemas(categorySchema._id);
        const generatedCategories = (await core.get(`/category-schemas/${categorySchema._id}`)) as ICategorySchema[];

        for await (const createdCategorySchema of generatedCategories) {
            await this.generateInnerCategorySchemas(createdCategorySchema, levels - 1);
        }
    }

    private async generateCategorySchemas(ownerId?: TObjectId) {
        const rootSchemaItemsCount = Math.round(Math.random() * 3) + 1;
        for (let a = 0; a < rootSchemaItemsCount; a++) {
            const categorySchema = this.createNewCategorySchema();
            await core.post(`/category-schemas${ownerId ? `/${ownerId}` : ''}`, categorySchema);
        }
    }

    private createNewCategorySchema(): Omit<IInitCategorySchema, '_id'> {
        return {
            name: utils.textGenerator.getEntities(1, 1, Math.round(Math.random()*5 + 10), true),
            description: utils.textGenerator.getText(Math.round(Math.random() * 2) + 1),
        }
    }
}
