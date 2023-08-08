import { IOpenApiGather, IOpenApiSerializable } from '~/openapi/components/model';

export interface ITsType extends IOpenApiSerializable {
    name?: string;

    toOpenApi(gatherer: IOpenApiGather): any;
    toOpenApi(gatherer: IOpenApiGather, asRef: boolean): any;
}

export enum ETsTypeKind {
    Primitive,
    Union,
    Intersection,
    Generic,
    Interface,
    Array,
    Type,
}

const IS_PRIMITIVE = ['string', 'number', 'boolean', 'object', 'void'];
const IS_ALIAS = ['Date', 'any'];

export const isPrimitive = (type: string) => IS_PRIMITIVE.includes(type);
export const isAlias = (type: string) => IS_ALIAS.includes(type);
export const aliasTo = (type: string) => {
    switch (type) {
        case 'Date': return 'string';
        case 'any': return 'object';
        default: return type;
    }
}
