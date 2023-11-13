import { ICommonEntity } from '~/backend/core/models';
import { IDbObjectBase, IInitPreviewed, IPreviewed } from './db-base.models';

// @OA:schema
// description: Artifact entity type enum
export enum EArtifactType {
    Item = 'item',
    Weapon = 'weapon',
    Armor = 'armor',
    Spell = 'spell',
    Skill = 'skill',
}

// @OA:schema
// description: Artifact entity subtype enum
export enum EArtifactSubtype {
    SteelArms = 'steelArms',
    FireArms = 'fireArms',
}

interface IBaseArtifact {
    // @OA:property
    // description: Artifact name
    name: string;

    // @OA:property
    // description: Artifact type
    type: EArtifactType;

    // @OA:property
    // description: Artifact subtype
    subtype?: EArtifactSubtype;
}

// artifacts owners:
// - projects (main)
// - characters
// - users

// @OA:schema
// description: Common artifact entity
export interface IArtifact extends IBaseArtifact, IDbObjectBase, Partial<IPreviewed> { }

// @OA:schema
// description: Update artifact entity client schema (create or update)
export interface IInitArtifact extends IBaseArtifact, Partial<ICommonEntity>, Partial<IInitPreviewed> { }
