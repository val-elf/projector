import { ICommonEntity, TObjectId } from '../../core/models';
import { EDbObjectStatuses, IEntityAction } from './db-base.models';

// @OA:schema
// description: 'Entity permission'
export interface IDbObjectPermission {
    // @OA:property
    // description: Permission type
    type: string;

    // @OA:property
    // description: Permission allow
    allow?: boolean;
}

// @OA:schema
// description: Common object interface for all entities
export interface IDbObject extends ICommonEntity {
    // @OA:property
    // description: Object type
    type: string;

    // @OA:property
    // description: Object status
    status: EDbObjectStatuses;

    // @OA:property
    // description: Object creation action
	_created: IEntityAction;

    // @OA:property
    // description: Object update action
	_updated?: IEntityAction;

    // @OA:property
    // description: Object delete action
    _deleted?: IEntityAction;

    // @OA:property
    // description: Object owner
    _owner?: TObjectId;

    // @OA:property
    // description: Object owners
    _owners?: TObjectId[];

    // @OA:property
    // description: Object owners permissions
    _owners_permissions?: {
        [key: string]: IDbObjectPermission[];
    };

    // @OA:property
    // description: Object tag ids
    _tags?: TObjectId[];
}

// @OA:schema
// description: Owned element
export interface IOwned {
    // @OA:property
    // description: Owner object definition
    __owner: IDbObject;
}

// @OA:schema
// description: tagged entities interface
export interface ITagged {
    // @OA:property
    // description: tags assigned to the entitiy
    _tags?: string[];
}

export class DbBase implements ICommonEntity {
    _id: TObjectId;
}

export type TInitialEntity<T> = Omit<T, '_coretype' | '_hash' | '_id'>