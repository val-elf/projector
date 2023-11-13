import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase, IInitPreviewed, IPreviewed } from './db-base.models';

// @OA:schema
// description: Base character interface
interface IBaseCharacter {
    // @OA:property
    // description: Character name
    name: string;

    // @OA:property
    // description: Character role
    role: string;

    // @OA:property
    // description: Character description
    description: string;
}

// @OA:schema
// description: Main Character interface
export interface ICharacter extends IBaseCharacter, Partial<IDbObjectBase>, Partial<IPreviewed> { }

// @OA:schema
// description: Initial and update character interface (sends from client side)
export interface IInitCharacter extends IBaseCharacter, Partial<ICommonEntity>, Partial<IInitPreviewed> { }