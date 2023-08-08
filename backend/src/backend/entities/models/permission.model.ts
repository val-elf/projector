import { IDbObjectBase } from './db-base.models';

export interface IPermission extends IDbObjectBase {
    value: string;
    type: string;
    group: string;
}