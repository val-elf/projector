import { EMethod, Route, Router, Service } from '~/network';
import { IDbObjectBase, IInitPreviewed, IPreviewed } from './dbbase.actual';
import { ICommonEntity } from './models.actual';
import { Artifacts } from '~/backend';
import { IRouter } from '~/backend/core/models';
import { utils } from '~/utils/utils';

// @OA:schema
// description: DbObject statuses
export enum EDbObjectStatuses {
    normal = 'normal',
    deleted = 'deleted',
}

// @OA:schema
// description: 'Entity permission'
export interface IDbObjectPermission {
    // @OA:property
    // description: Permission type
    type: string;

    // @OA:property
    // description: Permission allow
    allow?: boolean;
}


// @OA:schema
// description: Common entity id type
// type: string
export type TObjectId = string;


// @OA:schema
// description: Common object interface for all entities
export interface IDbObject extends ICommonEntity {
    // @OA:property
    // description: Object type
    type: string;

    // @OA:property
    // description: Object status
    status: EDbObjectStatuses;

    // @OA:property
    // description: Object owner
    _owner?: TObjectId;

    // @OA:property
    // description: Object owners
    _owners?: TObjectId[];

    // @OA:property
    // description: Object owners permissions
    _owners_permissions?: {
        [key: string]: IDbObjectPermission[];
    };

    // @OA:property
    // description: Object tag ids
    _tags?: TObjectId[];
}

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

// @OA:schema
// description: Artifact entity base schema
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
export interface IArtifact extends IBaseArtifact, Partial<IDbObjectBase>, Partial<IPreviewed> { }

// @OA:schema
// description: Update artifact entity client schema (create or update)
export interface IInitArtifact extends IBaseArtifact, Partial<ICommonEntity>, Partial<IInitPreviewed> { }


// @OA:tag
// name: Artifacts
// description: Project's artifacts management API
@Router()
export class ArtifactRouter implements IRouter {
    public model: Artifacts;

    private async _prepareArtifact(item) {
        await utils.preparePreview(item.preview);
    }

    configure(app: Service) {
        this.model = new Artifacts(app);
    }

    // @OA:route
    // description: Get list of artifacts for particular project
    // security: [APIKeyHeader: []]
    // responses: [200: List of artifacts of the project, 401: Bad request]
    // parameters: [projectId: Project ID]
    @Route(EMethod.GET, '/projects/:projectId/artifacts')
    public async getArtifactsList(key): Promise<IArtifact[]> {
        console.warn('[API] Get Artifacts', key);
        return await (this.model.getArtifactsList(key.projectId, key._metadata) as any as IArtifact[]);
    }

    // @OA:route
    // description: Get artifact by its ID
    @Route(EMethod.GET, '/artifacts/:artifactId')
    public async getArtifact(key): Promise<IArtifact> {
        console.warn('[API] Get Artifact', key);
        return await this.model.getArtifact(key.artifactId) as unknown as IArtifact;
    }

    // @OA:route
    // description: Create new artifact
    // parameters: [projectId: Project ID]
    @Route(EMethod.POST, '/projects/:projectId/artifacts')
    public async createArtifact(key, item): Promise<IArtifact> {
        console.warn('[API] Create Artifact', key);
        await this._prepareArtifact(item);
        return await this.model.createArtifact(item, key.projectId) as unknown as IArtifact;
    }

    // @OA:route
    // description: Update existing artifact
    @Route(EMethod.PUT, '/artifacts/:artifact')
    public async updateArtifact(key, item): Promise<IArtifact> {
        console.warn('[API] Update Artifact', key);
        await this._prepareArtifact(item);
        return await this.model.updateArtifact(item) as unknown as IArtifact;
    }


    // @OA:route
    // description: Delete artifact by its ID
    @Route(EMethod.DELETE, '/artifacts/:artifactId')
    public async deleteArtifact(key): Promise<{ deleted: boolean }> {
        console.warn('[API] Delete Artifact', key);
        await this.model.deleteArtifact(key.artifactId);
        return { deleted: true };
    }
}
