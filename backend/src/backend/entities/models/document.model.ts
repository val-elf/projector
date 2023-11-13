import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase, IInitPreviewed, IPreviewed } from './db-base.models';
import { IFile } from './file.model';

// @OA:schema
// description: Base Document interface
export interface IBaseDocument {
    // @OA:property
    // description: Document title
    title: string;

    // @OA:property
    // description: Document metadata
    metadata?: {
        size?: number;
        type?: string;
        lastModified?: number;
    };
}

// @OA:schema
// description: Output document interface (sends from client side)
export interface IDocument extends IBaseDocument, Partial<IDbObjectBase>, Partial<IPreviewed> {
    // @OA:property
    // description: Document file
    file?: IFile;
}

// @OA:schema
// description: Initial and update document interface (sends from client side)
export interface IInitDocument extends IBaseDocument, Partial<ICommonEntity>, Partial<IInitPreviewed> { }
