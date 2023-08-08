import { TObjectId } from '~/backend/core/models';
import { IDbObjectBase } from './db-base.models';

// @OA:schema
// description: User Role interface
export interface IRole extends IDbObjectBase {
    // @OA:property
    // description: Role name
    name: string;

    // @OA:property
    // description: Role permissions
    permissions: TObjectId[];
}