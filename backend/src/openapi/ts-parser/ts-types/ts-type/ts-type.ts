import { IOpenApiSerializable } from '../../../components/model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { ITsMethod, ITsProperty, ITsType } from '../model';
import { TsEntity, TsTypeOwner } from '../../model';
import { TsGenericsList } from '../ts-generics-list/ts-generics-list';

import util from 'util';
import { TsTypeService } from '~/openapi/services/ts-type.service';
import { TsGenericParameterItem } from '../ts-generics-list/ts-generic-parameter-item';

declare const UtilityTypes: TsType[];

export abstract class TsTypeBase extends TsEntity implements ITsType{
    name: string;
    public readonly entityType: ETsEntityTypes = ETsEntityTypes.Type;

    abstract isGeneric: boolean;
    abstract isUnion: boolean;
    abstract isIntersection: boolean;
    abstract genericList: TsGenericsList;
    abstract properties?: ITsProperty[];
    abstract methods?: ITsMethod[];
    abstract referencedTypeName?: string;
    abstract unionTypes?: ITsType[];
    abstract intersectTypes?: ITsType[];
    abstract genericBase?: ITsType;

    abstract getLatestUnion(): ITsType;
    abstract intersectWith(type: ITsType): void;
    abstract addUnionItem(member: ITsType): void;
    abstract populateMethods(methods: ITsMethod[]): void;
    abstract populateProperties(properties: ITsProperty[]): void;
    abstract populateReferenceName(name: string): void;

    public toOpenApi(genericParameters?: TsGenericsList): { [key: string]: any; } {
        if (this.referencedTypeName) {

            if (genericParameters) {
                const parameter = genericParameters.find((p: TsGenericParameterItem) => {
                    const ownerDefinition = TsTypeService.getService().findTsTypeDefinition((p.owner as TsType).referencedTypeName);
                    if (ownerDefinition.isGeneric) {
                        return ownerDefinition.genericList.find(g => g.name === this.referencedTypeName);
                    }
                }) as TsGenericParameterItem;
                if (parameter) {
                    return parameter.itemType.toOpenApi();
                }
            }

            const typeName = this.referencedTypeName !== 'any' ? this.referencedTypeName : 'object';
            return { '$ref': `#/components/schemas/${typeName}` };
        } else if (this.properties) {
            return {
                type: 'object',
                properties: this.properties.reduce((acc, prop) => {
                    acc[prop.name] = prop.propertyType.toOpenApi(genericParameters);
                    return acc;
                }, {}),
            };
        }
    }

    [util.inspect.custom]() {
        if (this.isGeneric) {
            return {
                type: 'Generic Type',
                base: this.genericBase,
                list: this.genericList,
            }
        } else {
            return {
                name: this.name,
                entityType: this.entityType,
                referencedTypeName: this.referencedTypeName,
                properties: this.properties,
                methods: this.methods,
                isUnion: this.isUnion,
                isIntersection: this.isIntersection
            }
        }
    }
}

export abstract class TsType extends TsTypeBase implements IOpenApiSerializable, ITsType {

    // generic arguments for generic types, like Promise<string>, Array<number>, etc.
    protected _genericList?: TsGenericsList;
    protected _genericBase?: ITsType;
    protected _isAlias: boolean;
    protected _owner?: TsTypeOwner;

    // union and intersection types
    protected _intersectionTypes: ITsType[];

    // could be primitive type, like string, number, any etc. or generic type, like a Promise, Array, Observable, etc.
    protected _referencedTypeName: string | undefined;

    protected _methods: ITsMethod[];
    protected _properties: ITsProperty[];

    public get referencedTypeName(): string { return this._referencedTypeName; }

    public abstract isGeneric;
    public abstract isUnion;

    public get genericBase(): ITsType { return this._genericBase; }
    public get isIntersection(): boolean { return this._intersectionTypes?.length > 0; }
    public get isAlias(): boolean { return this._isAlias; } // to do make it more precise
    public get owner(): TsTypeOwner { return this._owner; }
    public intersectTypes?: ITsType[];

    public get isPrimitive(): boolean {
        return TsTypeService.PRIMITIVES.includes(this);
    }

    public get properties(): ITsProperty[] {
        return this._properties ?? [];
    }

    public get methods(): ITsMethod[] {
        return this._methods;
    }

    public get genericList(): TsGenericsList {
        return this._genericList;
    }

    constructor(owner?: TsTypeOwner) {
        super('');
        this._owner = owner;
    }

    public getRequiredProperties(): ITsProperty[] {
        return this._properties.filter(p => !p.isOptional);
    }

    public abstract addUnionItem(member: ITsType);

    public intersectWith(type: ITsType): void {
        if (!this.isIntersection) {
            this._intersectionTypes = [this.clone()];
            this.clean();
        }
        this._intersectionTypes.push(type);
    }

    public static isParameterType(type: TsType) {
        return UtilityTypes.includes(type) || type.isPrimitive;
    }

    protected abstract clone(): ITsType;
    public popuplateReferenceName(name: string): void {
        this._referencedTypeName = name;
    }
    public abstract populateMethods(methods: ITsMethod[]): void;
    public abstract populateProperties(properties: ITsProperty[]): void;

    protected clean() {
        this._referencedTypeName = undefined;
        this._methods = [];
        this._properties = [];
        this._isAlias = false;
        this._intersectionTypes = [];
        this._genericList = undefined;
    }
}

