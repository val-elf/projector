export interface TestInterface<Krate, BGeneric extends Promise<Krate>, Authentic extends Object>
    extends Object, BaseType<Krate, BGeneric> {
        k: Promise<BGeneric>;
        b?: Promise<Authentic>;
        a: Krate;
    };

interface BaseType<N, K> {
    name: string
    init: Promise<N>;
    getProperties(): Promise<K>;
}

export interface ICharacter extends IBaseCharacter, Partial<IDbObjectBase>, Partial<IPreviewed> {}

// @OA:schema
// description: 'Entity permission'
export interface IDbObjectPermission {
    // @OA:property
    // description: Permission type
    type: string;

    // @OA:property
    // description: Permission allow
    allow?: boolean;

    // @OA:property
    // description: date instance
    created: Date;
}

interface IOmitExtender extends Omit<TestInterface<string, Promise<string>, Date>, 'k' | 'b'> {
}

interface IAdditionalProperty extends Partial<IDbObjectPermission>{
    [key: string]: boolean;
}

interface IUsingAdditional {
    element: IAdditionalProperty;
    extracted: {
        [key: string]: number;
    };
}