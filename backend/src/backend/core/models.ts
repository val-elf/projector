import { Service } from '~/network/service';
import { IEntityController } from './entity-processor';
import { ObjectId } from 'mongodb';

export type TObjectId = string | ObjectId;

export interface ICommonEntity {
	_id: TObjectId;
}

export interface IDbEntity<TEntity extends ICommonEntity> {
    _doc: TEntity
}

export type TFindArray<T extends ICommonEntity> = T[];
export type TFindList<T extends ICommonEntity> = {
    result: TFindArray<T>;
    options: { [key: string]: string | number | boolean | null | undefined };
}

export type TFindListResult<T extends ICommonEntity> =  TFindList<T> | { count: number };

export interface IRouter {
    model: IEntityController<any>;
    configure(app: Service);
}