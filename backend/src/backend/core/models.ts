import { Service } from '~/network/service';
import { IEntityController } from './entity-processor';
import { ObjectId } from 'mongodb';

// @OA:schema
// type: string
export type TObjectId = string | ObjectId;

// @OA:schema
// description: Common entity interface
export interface ICommonEntity {
    // @OA:property
    // description: Entity identity
	_id?: TObjectId;
}

export interface IDbEntity<TEntity extends ICommonEntity> {
    _doc: TEntity
}

export interface IFindList<T extends ICommonEntity> {
    result: T[];
    options: { [key: string]: string | number | boolean | null | undefined };
};

export type TFindListResult<T extends ICommonEntity> =  IFindList<T> | { count: number };

export interface IRouter {
    model: IEntityController<any, any>;
    configure(app: Service);
}