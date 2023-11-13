import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase } from './db-base.models';

interface IBaseCategorySchema {
    // @OA:property
     // description: Category schema name
     name: string;

     // @OA:property
     // description: Category description
     description: string;
}

// @OA:schema
// description: Hyerarchial structure of categories for the Project
export interface ICategorySchema extends IBaseCategorySchema, IDbObjectBase {}

// @OA:schema
// description: Update case for CategorySchema item (create or update)
export interface IInitCategorySchema extends IBaseCategorySchema, Partial<ICommonEntity> {}

// @OA:schema
// description: Hyerarchial structure of categories schemas for the Project
export interface IHierarchyCategorySchemaItem extends ICategorySchema {
    children?: IHierarchyCategorySchemaItem[]
}