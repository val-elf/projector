

import { ICommonEntity } from './models.actual';

// @OA:schema
// type: string
export type TObjectId = string;

// @OA:schema
// description: Entity historical action
export interface IEntityAction {
    // @OA:property
    // description: Action date
    _dt: Date;

    // @OA:property
    // description: Action user
    _user: TObjectId;
}

// @OA:schema
// description: DbObject statuses
export enum EDbObjectStatuses {
    normal = 'normal',
    deleted = 'deleted',
}

// @OA:schema
// description: DbObject base interface
export interface IDbObjectBase extends ICommonEntity {
    // @OA:property
    // description: Core type
	_coretype: string;

    // @OA:property
    // description: Object hash
	_hash: string;
}

// @OA:schema
// description: Preview interface for dbObjects
export interface IPreview extends ICommonEntity {
    // @OA:property
    // description: Preview image, base64 encoded
    // format: base64
    preview?: string;

    // @OA:property
    // description: Preview image type
    // type: string
    // enum: [image/jpeg, image/png, image/gif, image/svg+xml, image/webp]
    type: string;

    // @OA:property
    // description: Image hash (md5)
    // type: string
    hash: string;

    // @OA:property
    // description: Image width (px)
    // type: number
    width: number;

    // @OA:property
    // description: Image height (px)
    // type: number
    height: number;
}


// @OA:schema
// description: Previewed interface for dbObjects
export interface IPreviewed {
    // @OA:property
    // description: Preview image
    preview: IPreview;
}

// @ OA:schema
// description: initial Preview interface for dbObjects
export interface IInitPreviewed {
    // @OA:property
    // description: Preview image, base64 encoded
    // format: base64
    preview: string;
}

export interface IFilterOptions {
    skip?: number;
    total?: number;
    limit?: number;
    page?: number;
}

// @OA:schema
// description: Session interface
export interface ISession extends ICommonEntity {
    // @OA:property
    // description: Session user id
    user: TObjectId;

    // @OA:property
    // description: expiration flag
    expired?: boolean;
}

type TMetadataAtom = string | number | boolean;
export interface IMetadata {
    [key: string]: TMetadataAtom | TMetadataAtom[] | IMetadata;
}