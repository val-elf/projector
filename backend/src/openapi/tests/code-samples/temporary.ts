import { EMethod, Route, Router } from '~/network';

export interface QualifyiedInterface<T> {
    room: string;
    proj: T[];
}

// @OA:schema
// name: Artifact
export interface Artifact<T, A extends { b: boolean; t: string }> extends QualifyiedInterface<T> {
    // @OA:property
    // description: Artifact's ID
    id: T;

    // @OA:property
    // description: Artifact's name
    name: string;

    // @OA:property
    // description: get artifacts properties
    getProperties(): Promise<number[]>;
}

/*
// @OA:tag
// name: Artifacts
// description: Project's artifacts management API
@Router()
export class ArtifactRouter  {

    // @OA:route
    // description: Delete artifact by its ID
    @Route(EMethod.DELETE, '/artifacts/:artifactId')
    public async deleteArtifact(key): Promise<{ deleted: boolean }> {
        console.warn('[API] Delete Artifact', key);
        return Promise.resolve({ deleted: true });
    }

    public async helloArtifact(): Promise<boolean> {
        return Promise.resolve(false);
    }
}
*/