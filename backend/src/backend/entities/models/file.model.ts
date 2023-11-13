import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase, IPreviewed } from './db-base.models';

// @OA:schema
// description: File status
export interface IFileStatus {
    status: string;
    exif?: string;
    preview?: string;
}

// @OA:schema
// description: Base File interface
export interface IBaseFile {
    // @OA:property
    // description: File name
    name: string;

    // @OA:property
    // description: File path
    file: string;

    // @OA:property
    // description: File type
    type: string;

    // @OA:property
    // description: File size
    size: number;

    // @OA:property
    // description: Transcoder id to use
    transcoder?: string;

    // @OA:property
    // description: Transcode process id
    _transcode?: string;

    // @OA:property
    // description: Exif data
    exif?: { [key: string]: string | number | boolean };

    // @OA:property
    // description: File status
    _status?: IFileStatus;
}

// @OA:schema
// description: Main output File interface
export interface IFile extends IBaseFile, IDbObjectBase, Partial<IPreviewed> {}

// @OA:schema
// description: Initial and update File interface (sends from client side)
export interface IInitFile extends IBaseFile, Partial<ICommonEntity>, Partial<IPreviewed> {}
