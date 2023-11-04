import {
    IOAContainer,
    IOAProperty,
    IOARoute,
    IOpenApiSerializable,
} from "~/openapi/components/model";
import { ITsDecorator, ITsEntity, ITsParametersList } from "../model";
import { TsGenericsList } from "./ts-generics-list/ts-generics-list";
import { TsCodeBlock } from "../ts-code-block/ts-code-block";
import { TsClass } from "./ts-type-definitions/ts-class-definition";
import { TsInterfaceDefinition, TsTypeDefinition } from "./ts-type-definitions";

export interface ITsType extends IOpenApiSerializable, ITsEntity {
    isGeneric: boolean;
    isUnion: boolean;
    isIntersection: boolean;
    genericList: TsGenericsList;
    properties?: ITsProperty[];
    methods?: ITsMethod[];
    referencedTypeName?: string;
    unionTypes?: ITsType[];
    intersectTypes?: ITsType[];
    genericBase?: ITsType;

    toOpenApi(genericsParameters?: TsGenericsList): any;
    getLatestUnion(): ITsType;
    intersectWith(type: ITsType): void;
    addUnionItem(member: ITsType): void;

    populateReferenceName(name: string): void;
    populateMethods(methods: ITsMethod[]): void;
    populateProperties(properties: ITsProperty[]): void;
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

export interface ITsProperty extends ITsEntity, IOAContainer<IOAProperty>, IOpenApiSerializable {
    name: string;
    propertyType: ITsType;
    definition?: IOAProperty;
    isOptional: boolean;
    isReadonly: boolean;
}

export interface ITsMethod extends ITsEntity, IOAContainer<IOARoute>, IOpenApiSerializable {
    name: string;
    returnType: ITsType;
    isAbstract: boolean;
    isStatic?: boolean;
    isAsync?: boolean;
    parameters: ITsParametersList;
    body?: TsCodeBlock;

    decorators?: ITsDecorator[];
    methodOwner: TsClass | TsInterfaceDefinition | TsTypeDefinition;
}

const IS_PRIMITIVE = ["string", "number", "boolean", "object", "void"];
const IS_ALIAS = ["Date", "any"];

export const isPrimitive = (type: string) => IS_PRIMITIVE.includes(type);
export const isAlias = (type: string) => IS_ALIAS.includes(type);
export const aliasTo = (type: string) => {
    switch (type) {
        case "Date":
            return "string";
        case "any":
            return "object";
        default:
            return type;
    }
};
