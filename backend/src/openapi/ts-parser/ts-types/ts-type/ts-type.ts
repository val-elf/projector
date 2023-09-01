import { IOpenApiGather, IOpenApiSerializable } from '../../../components/model';
import { ETsEntityTypes, ITsParser } from '../../ts-readers/model';
import { TsTypeParser } from './ts-type-parser';
import { ITsProperty } from '../ts-property';
import { ITsType, aliasTo } from '../model';

import util from 'util';
import { TsInterfaceDefinition } from '../ts-type-definitions';
import { TsAddtitionalInterfaceProperty } from '../ts-type-definitions/ts-interface-definition/ts-additional-interface-property';
import { TsEntity } from '../../model';

export class TsType extends TsEntity implements IOpenApiSerializable, ITsType {

    // generic arguments for generic types, like Promise<string>, Array<number>, etc.
    private _genericArguments: TsType[];
    private _isGeneric: boolean;
    private _isAlias: boolean;

    // union and intersection types
    private _unionTypes: TsType[];
    private _intersectionTypes: TsType[];

    // could be primitive type, like string, number, any etc. or generic type, like a Promise, Array, Observable, etc.
    private _referencedTypeName: string | undefined;
    private _interfaceDefinition: TsInterfaceDefinition | undefined;

    public get referencedTypeName(): string { return this._referencedTypeName; }

    public get isGeneric(): boolean { return this._isGeneric; }
    public get isArray(): boolean { return this._referencedTypeName === 'Array'; }
    public get isUnion(): boolean { return this._unionTypes?.length > 0; }
    public get isIntersection(): boolean { return this._intersectionTypes?.length > 0; }
    public get isInterface(): boolean { return this._interfaceDefinition !== undefined; }
    public get isAlias(): boolean { return this._isAlias; } // to do make it more precise

    public get isPrimitive(): boolean {
        return ['string', 'number', 'boolean', 'any'].includes(this._referencedTypeName ?? '');
    }

    public get properties(): ITsProperty[] {
        return this._interfaceDefinition?.properties ?? [];
    }

    public get genericArguments(): TsType[] {
        return this._genericArguments;
    }

    constructor(defintion: string, genericArguments?: TsType[]);
    constructor(parser: ITsParser);
    constructor(parserOrDefinition: ITsParser| string, genericArguments?: TsType[]) {
        const parser = new TsTypeParser(parserOrDefinition);
        super('', ETsEntityTypes.Type);

        if (typeof parserOrDefinition === 'string') {
            this._genericArguments = genericArguments;
        } else {

        }

        // read definition
        const readTypeDeclaration = parser.readTypeDeclaration();
        console.log('Type declaration reads:', readTypeDeclaration);
        // this._isAlias = !!readTypeDeclaration.isAlias;
    }

    public getRequiredProperties(): ITsProperty[] {
        if (!this._interfaceDefinition) return [];
        return this._interfaceDefinition.properties?.filter(p => !p.isOptional) ?? [];
    }

    public toOpenApi(gatherer: IOpenApiGather) {
        if (this.isUnion) {
            return {
                'oneOf': this._unionTypes.map(t => t.toOpenApi(gatherer)),
            };
        } else if (this.isInterface) {
            return this._interfaceDefinition.toOpenApi(gatherer);
        } else if (this.referencedTypeName) {
            if (this.isArray) {
                return {
                    type: 'array',
                    items: this.genericArguments[0].toOpenApi(gatherer),
                };
            } else if (this.referencedTypeName === 'Promise') {
                return this.genericArguments[0].toOpenApi(gatherer);
            } else {
                const typeName = this.referencedTypeName !== 'any' ? this.referencedTypeName : 'object';
                return { '$ref': `#/components/schemas/${typeName}` };
            }
        }
    }

    public static readonly String = new TsType('string');
    public static readonly Any = new TsType('object');

/*
    private _toOpenApi(gatherer: IOpenApiGather) {

        if (this.isGeneric && this.referencedTypeName === 'Promise')
            return this.genericArguments[0].toOpenApi(gatherer);

        if (this.isPrimitive) {
            return { type: this.referencedTypeName };
        }

        if (this.isUnion) {
            const definedTypes = this._unionTypes.filter(t => t.isPrimitive || gatherer.typeExists(t.referencedTypeName));
            if (definedTypes.length > 1) {
                return {
                    oneOf: definedTypes.map(t => t.toOpenApi(gatherer))
                }
            } else if (definedTypes.length === 1) {
                return definedTypes[0].toOpenApi(gatherer);
            }
        }

        if (this.isInterface) {
            const regularProperties = this.properties?.filter(p => !(p instanceof TsAddtitionalInterfaceProperty)) ?? [];
            const additionalProperties = this.properties?.filter(p => p instanceof TsAddtitionalInterfaceProperty) ?? [];
            return {
                type: 'object',
                ...( regularProperties.length ? { properties: this.getPropertiesDeclarations(regularProperties, p => p.toOpenApi(gatherer), gatherer) } : {}),
                ...( additionalProperties.length ? { additionalProperties: this.getPropertiesDeclarations(additionalProperties, p => p.toOpenApi(gatherer), gatherer) } : {}),
            };
        }

        if (this.isArray) {
            return {
                type: 'array',
                items: this.genericArguments[0].toOpenApi(gatherer)
            }
        }

        return this.isPrimitive ? { type: this.referencedTypeName } :
            (
                this.isAlias ? { type: aliasTo(this.referencedTypeName) } :
                { $ref: `#/components/schemas/${this.referencedTypeName}` }
            )
        ;
    }

    private getPropertiesDeclarations(properties: ITsProperty[], mapper: (property: ITsProperty) => any, gatherer: IOpenApiGather) {
        mapper = mapper ? mapper : p => p.toOpenApi(gatherer);
        return (properties?.map(mapper) ?? []).reduce((acc, prop) => ({ ...acc, ...prop }), {});
    }
*/

    [util.inspect.custom]() {
        return {
            type: this.referencedTypeName,
            properties: this.properties,
        }
    }
}