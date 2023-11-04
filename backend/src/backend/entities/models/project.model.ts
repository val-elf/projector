import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase, IInitPreviewed, IPreviewed } from './db-base.models';

interface IBaseProject {
    // @OA:property
    // description: Project name
    name: string;

    // @OA:property
    // description: Project description
    description?: string;
}

// @OA:schema
// description: Project entity database schema
export interface IProject extends IBaseProject, Partial<IDbObjectBase>, Partial<IPreviewed> { }

// @OA:schema
// description: Update project entity client schema (create or update)
export interface IInitProject extends IBaseProject, Partial<ICommonEntity>, Partial<IInitPreviewed> { }
