// @OA:schema
// description: Db Object types
enum EDbObjectType {
    created = 'created',
    updated = 'updated',
    deleted = 'deleted',
}

interface IDbServiceBase {
    _created: Date;
    _updated?: Date;
    _deleted?: Date;
}

// @OA:schema
// description: Db Base item
export interface IDbBase extends IDbServiceBase{
    id: string;
    objectType: EDbObjectType;
}

// @OA:schema
// description: Element item
export interface IElement {
    name: string;
    date: Date;
    [key: string]: string | Date | EDbObjectType[];
}

// @OA:schema
export interface IInputElement extends Omit<IElement, '_created' | '_updated' | '_deleted'> {
    arrayType: number[];
}

// @OA:schema
// description: Element item type
export enum EElementTypes {
    light = 'light',
    heavy = 'heavy',
    medium = 'medium',
}


