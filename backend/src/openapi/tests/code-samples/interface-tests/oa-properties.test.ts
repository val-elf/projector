interface QualifyiedInterface<T> {
    qualifier: string;
    value: T;
}

// @OA:schema
// name: Artifact
export interface Artifact<T, A extends { b: boolean; t: string }> extends QualifyiedInterface<T> {
    // @OA:property
    // description: Artifact's ID
    id: T;

    faith: A;

    // @OA:property
    // description: Artifact's name
    name: string;

    // @OA:property
    // description: get artifacts properties
    getProperties(): Promise<number[]>;
}

export {Artifact as Artifact2};
