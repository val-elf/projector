// @OA:tag
// name: Artifacts
// description: Project's artifacts management API
@Router()
export class ArtifactRouter<T extends { a: boolean }> extends Object implements ICommonEntity, IDbBaseObject<T> {

    _id: TObjectId<T>;

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

    getNavigation = async (param1: string, param2: boolean): Promise<boolean> => {
        return Promise.resolve(true);
    }
}