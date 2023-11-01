import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase } from './db-base.models';

interface IBaseCategory {
   // @OA:property
    // description: Category name
    name: string;

    // @OA:property
    // description: Category description
    description: string;
}

// @OA:schema
// description: Category
export interface ICategory extends IBaseCategory, IDbObjectBase {}

// @OA:schema
// description: Initiated category item
export interface IInitCategory extends IBaseCategory, Partial<ICommonEntity> {}