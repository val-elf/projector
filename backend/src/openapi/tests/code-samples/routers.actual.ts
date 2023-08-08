import { utils } from "~/utils/utils";
import { Route, Service } from "~/network";
import { EMethod, Router } from "~/network/route.decorator";
import { IRouter } from '~/backend/core/models';
import { Artifacts } from '~/backend';


// @OA:schema
// description: Common error response
export interface IError {
    // @OA:property
    // description: Error message
    message: string;

    // @OA:property
    // description: Error code
    code: number;
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
export interface IArtifact extends IBaseArtifact { }

// @OA:schema
// description: Update artifact entity client schema (create or update)
export interface IInitArtifact extends IBaseArtifact { }



// @OA:tag
// name: SampleRouter
// description: Sample Route description
@Router()
export class SampleRouter implements IRouter {
    public model: Artifacts;

    private async _prepareArtifact(item): Promise<any> {
        await utils.preparePreview(item.preview);
    }

    configure(app: Service): void {
        this.model = new Artifacts(app);
    }

    // @OA:route
    // description: Get list of artifacts for particular project
    // security: [APIKeyHeader: []]
    // tags: [SampleRouter]
    // responses: [200: List of artifacts, 401: Bad request]
    // parameters: [entityId: Entity ID]
    @Route(EMethod.GET, "/entity/:entityId/subEntity", { })
    public async getArtifactsList(key, name = "lalaland", value = (3 - 1) * 6): Promise<IArtifact[]> {
        console.warn("[API] Get Artifacts", key);
        return await this.model.getArtifactsList(key.project, key._metadata);
    }

}
