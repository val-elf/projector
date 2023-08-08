import { ICommonEntity, TObjectId } from '~/backend/core/models';
import { IDbObjectBase, IInitPreviewed, IPreviewed } from './db-base.models';

// @OA:schema
// description: 2D coordinate
export interface ICoord2D {
    // @OA:property
    // description: X coordinate
    x: number;

    // @OA:property
    // description: Y coordinate
    y: number;
}

// @OA:schema
// description: Array of the 2D coordinates
export type TShape = ICoord2D[];

// @OA:schema
// description: Location image
export interface IImage extends ICoord2D {
    // @OA:property
    // description: Image file id
    _file: TObjectId;

    // @OA:property
    // description: Image width (px)
    width: number;

    // @OA:property
    // description: Image height (px)
    height: number;

    // @OA:property
    // description: Image zoom
    zoom: number;
};

// @OA:schema
// description: Location type enum
export enum ELocationType {
    Building = 'building',
    Street = 'street',
    City = 'city',
    Country = 'country',
    State = 'state',
    Mainland = 'mainland',
    Continent = 'continent',
    Planet = 'planet',
    Galaxy = 'galaxy',
    Universe = 'universe',
    Multiverse = 'multiverse',
    Georegion = 'georegion',
}

// @OA:schema
// description: Base Location interface
interface IBaseLocation {
    // @OA:property
    // description: Location name
    name: string;

    // @OA:property
    // description: Location type
    locationType: ELocationType;

    // @OA:property
    // description: Location description
    description: string;

    // @OA:property
    // description: Location position
    position: ICoord2D;

    // @OA:property
    // description: Location map
    map: {
        shape?: TShape;
        image?: IImage;
    }[];

    // @OA:property
    // description: Location map file id
    _mapFile?: TObjectId;

    // @OA:property
    // description: Location scale factor
    scale?: number;

    // @OA:property
    // description: Location parent information structur
    parent?: {
        position: ICoord2D;
        scale: number;
        _location: TObjectId;
    };
}

// @OA:schema
// description: Main output Location interface
export interface ILocation extends IBaseLocation, Partial<IDbObjectBase>, Partial<IPreviewed> { }

// @OA:schema
// description: Initial and update Location interface (sends from client side)
export interface IInitLocation extends IBaseLocation, Partial<ICommonEntity>, Partial<IInitPreviewed> { }