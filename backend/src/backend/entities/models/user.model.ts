import { TObjectId } from '~/backend/core/models';
import { IDbObjectBase } from './db-base.models';
import { IRole } from './role.model';

// @OA:schema
// description: Base User interface
export interface IBaseUser {
    login: string;
    email: string;
    password: string;
    _roles: TObjectId[];
}

// @OA:schema
// description: User interface
export interface IUser extends IBaseUser, Partial<IDbObjectBase> { }

// @OA:schema
// description: User interface for server side
export interface IServerUser extends Partial<IUser> {
    roles: IRole[];
}
