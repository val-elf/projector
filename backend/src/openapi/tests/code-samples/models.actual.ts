import { ObjectId } from 'mongodb';

// @OA:schema
// description: Common entity id type
// type: string
export type TObjectId = string | ObjectId;

// @OA:schema
// description: Common entity interface
export interface ICommonEntity {
    // @OA:property
    // description: Entity identity
	_id?: TObjectId[];
}

export interface IDbEntity<TEntity extends ICommonEntity> {
    _doc: TEntity
}

export type TFindArray<T extends ICommonEntity> = T[];
export type TFindList<T extends ICommonEntity> = {
    result: TFindArray<T>;
    options: { [key: string]: string | number | boolean | null | undefined };
}

export type TFindListResult<T extends ICommonEntity> = TFindList<T> | { count: number };

export interface IRouter {
    // model: IEntityController<any>;
    // configure(app: Service);
}