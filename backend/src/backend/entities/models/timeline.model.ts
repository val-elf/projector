import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase } from './db-base.models';

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

// @OA:schema
// description: Timeline interface
export interface ITimeline extends IBaseTimeline, Partial<IDbObjectBase> { }

// @OA:schema
// description: Init timeline interface
export interface IInitTimeline extends IBaseTimeline, Partial<ICommonEntity> { }
