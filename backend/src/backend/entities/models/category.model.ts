import { IDbObjectBase } from './db-base.models';

// @OA:schema
// description: Category
export interface ICategory extends IDbObjectBase {
    // @OA:property
    // description: Category name
    name: string;

    // @OA:property
    // description: Category description
    description: string;
}