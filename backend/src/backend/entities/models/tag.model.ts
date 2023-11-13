import { IDbObjectBase } from './db-base.models';

// @OA:schema
// description: Tag
export interface ITag extends IDbObjectBase {
    // @OA:property
    // description: Tag name
    name: string;
}


