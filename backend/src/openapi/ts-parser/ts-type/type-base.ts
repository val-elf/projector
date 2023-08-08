import util from "util";

import { IOpenApiGather, IOpenApiSerializable } from '~/openapi/components/model';
import { ITsProperty } from './ts-property';
import { ETsTypeKind, aliasTo, isAlias, isPrimitive } from './model';
import { TypeReader } from './type-reader';
import { TsAddtitionalInterfaceProperty } from './ts-type-definitions/ts-interface-definition/ts-additional-interface-property';

export class TsTypeBase implements IOpenApiSerializable {

    // #region private fields
    private _isUnion: boolean;
    private _isArray: boolean;
    private _isIntersection: boolean;
    private _isPrimitive: boolean;
    private _isAlias: boolean;
    private _isInterface: boolean;
    private _unionTypes: TsTypeBase[];
    private _intersectionTypes: TsTypeBase[];
    private _promiseType: TsTypeBase;
    private _primitiveType: string;
    private _properties: ITsProperty[];
    private readonly _isGeneric: boolean = false;
    private _genericArguments: TsTypeBase[];
    private _genericType?: TsTypeBase;
    private readonly definition: string;
    // #endregion private fields

    // #region properties

    public get isUnion(): boolean {
        return this._isUnion;
    };

    public get isArray(): boolean {
        return this._isArray;
    }

    public get isGeneric(): boolean {
        return this._isGeneric;
    }

    public get genericType() {
        return this._genericType;
    }

    public get typeName() {
        return this._isGeneric ?
            this._genericType.typeName :
            this._primitiveType;
    }

    public get genericArguments(): TsTypeBase[] {
        return this._genericArguments;
    }

    public get isIntersection(): boolean {
        return this._isIntersection;
    }

    public get isPrimitive(): boolean {
        return this._isPrimitive;
    }

    public get isInterface() {
        return this._isInterface;
    }

    public get unionTypes(): TsTypeBase[] {
        return this._unionTypes;
    }

    public get intersectionTypes(): TsTypeBase[] {
        return this._intersectionTypes;
    }

    public get promiseType(): TsTypeBase {
        return this._promiseType;
    }

    public get primitiveType(): string {
        return this._primitiveType;
    }

    public get properties(): ITsProperty[] {
        return this._properties;
    }

    // #endregion properties

    constructor(definitionr: string, asType: boolean = false) {
        this.definition = definitionr.trim();
        let typeEntities = [];
        this._isPrimitive = isPrimitive(this.definition);
        this._isAlias = isAlias(this.definition);

        if (asType) {
            this._primitiveType = this.definition;
            return;
        }

        const reader = new TypeReader(this.definition);
        let previousEntity: ETsTypeKind | undefined;
        while (true) {
            const entity = reader.readTypeEntity();
            if (!entity) {
                break;
            }
            if (entity === ETsTypeKind.Array) {
                this._isArray = true;
                this._genericType = typeEntities.pop();
            }
            if (entity === ETsTypeKind.Generic) {
                this._isGeneric = true;
                this._genericType = typeEntities.pop();
                const params = reader.readGenericParameters();
                this._genericArguments = params ?? [];
                continue;
            }
            if (entity === ETsTypeKind.Union) {
                this._isUnion = true;
                this._unionTypes = [...(this._unionTypes ?? []), ...typeEntities];
                previousEntity = entity;
                typeEntities = [];
                continue;
            }
            if (entity instanceof Array) {
                this._properties = entity;
                this._isInterface = true;
                break;
            }
            if (entity instanceof TsTypeBase) {
                if (previousEntity === ETsTypeKind.Union) {
                    this._unionTypes.push(entity);
                } else {
                    typeEntities.push(entity);
                }
            }
            previousEntity = undefined;
        }
        if (typeEntities.length === 1) {
            this._primitiveType = typeEntities[0].primitiveType;
            this._isPrimitive = typeEntities[0].isPrimitive;
        }
    }

    private getPropertiesDeclarations(properties: ITsProperty[], mapper: (property: ITsProperty) => any, gatherer: IOpenApiGather) {
        mapper = mapper ? mapper : p => p.toOpenApi(gatherer);
        return (properties?.map(mapper) ?? []).reduce((acc, prop) => ({ ...acc, ...prop }), {});
    }

    public toOpenApi(gatherer: IOpenApiGather, mapper?: (property: ITsProperty) => any) {

        if (this.isGeneric && this.primitiveType === 'Promise')
            return this.genericArguments[0].toOpenApi(gatherer, mapper);

        if (this.isPrimitive) {
            return { type: this.primitiveType };
        }

        if (this.isUnion) {
            const definedTypes = this.unionTypes.filter(t => t.isPrimitive || gatherer.typeExists(t.typeName));
            if (definedTypes.length > 1) {
                return {
                    oneOf: definedTypes.map(t => t.toOpenApi(gatherer, mapper))
                }
            } else if (definedTypes.length === 1) {
                return definedTypes[0].toOpenApi(gatherer, mapper);
            }
        }

        if (this.isInterface) {
            const regularProperties = this.properties?.filter(p => !(p instanceof TsAddtitionalInterfaceProperty)) ?? [];
            const additionalProperties = this.properties?.filter(p => p instanceof TsAddtitionalInterfaceProperty) ?? [];
            return {
                type: 'object',
                ...( regularProperties.length ? { properties: this.getPropertiesDeclarations(regularProperties, mapper, gatherer) } : {}),
                ...( additionalProperties.length ? { additionalProperties: this.getPropertiesDeclarations(additionalProperties, mapper, gatherer) } : {}),
            };
        }

        if (this.isArray) {
            return {
                type: 'array',
                items: this.genericType.toOpenApi(gatherer, mapper)
            }
        }

        return this.isPrimitive ? { type: this.primitiveType } :
            (
                this._isAlias ? { type: aliasTo(this.primitiveType) } :
                { $ref: `#/components/schemas/${this.primitiveType}` }
            )
        ;
    }

    [util.inspect.custom]() {
        return {
            definition: this.definition,
            isPrimitive: this.isPrimitive,
            isUnion: this.isUnion,
            isGeneric: this.isGeneric,
            isInterface: this.isInterface,
            isArray: this.isArray,
        }
    }
}
