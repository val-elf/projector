import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase } from './db-base.models';

// @OA:schema
// description: Base timeline interface
export interface IBaseTimeline {
    // @OA:property
    // description: Timeline name
    name: string;

    // @OA:property
    // description: Timeline description
    description?: string;

    // @OA:property
    // description: Timeline start date
    startDate: string;

    // @OA:property
    // description: Timeline end date
    endDate: string;

    // @OA:property
    // description: Timeline locked
    locked?: boolean;
}

export interface ITimeline extends IBaseTimeline, Partial<IDbObjectBase> { }

export interface IInitTimeline extends IBaseTimeline, Partial<ICommonEntity> { }
