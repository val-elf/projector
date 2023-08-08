import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase } from './db-base.models';

// @OA:schema
// description: Base timespot interface
export interface IBaseTimespot {
    // @OA:property
    // description: Timespot start date
    startDate: string;

    // @OA:property
    // description: Timespot start offset
    startOffsetX?: number;

    // @OA:property
    // description: Timespot end date
    endDate?: string;

    // @OA:property
    // description: Timespot end offset
    endOffsetX?: number;

    // @OA:property
    // description: Timespot offset
    offsetX?: number;

    // @OA:property
    // description: Timespot title
    title: string;

    // @OA:property
    // description: Timespot description
    description?: string;

    // @OA:property
    // description: Timespot locked
    locked?: boolean;
}

export interface ITimespot extends IBaseTimespot, Partial<IDbObjectBase> { }

export interface IInitTimespot extends IBaseTimespot, Partial<ICommonEntity> { }