import { IOpenApiGather, IOpenApiSerializable } from '../../components/model';
import { ETsEntityTypes, ITsReader, TsEntity } from '../ts-readers/model';
import { TsTypeParser } from './ts-type-parser';
import { ITsProperty } from './ts-property';
import { ITsType } from './model';
import { TsTypeBase } from './type-base';

import util from 'util';

export class TsType extends TsEntity implements IOpenApiSerializable, ITsType {
    private baseType: TsTypeBase;
    private definition: string;

    public get isGeneric(): boolean { return this.baseType.isGeneric; }
    public get genericParameters(): TsTypeBase[] { return this.baseType.genericArguments; }
    public get genericType() { return this.baseType.genericType; }
    public get typeName(): string {
        return this.baseType.isGeneric ? this.baseType.genericArguments[0].typeName : this.baseType.primitiveType;
    }

    public get genericArguments(): TsTypeBase[] {
        return this.baseType.isGeneric ? this.baseType.genericArguments : [];
    }

    public get properties(): ITsProperty[] {
        return this.baseType.isGeneric ? this.genericArguments[0].properties : this.baseType.properties;
    }

    constructor(reader: ITsReader);
    constructor(definition: string);
    constructor(readerOrDefinition: ITsReader | string) {
        super('', ETsEntityTypes.Type);

        if (typeof readerOrDefinition === "string") {
            this.definition = readerOrDefinition;
        } else {
            // read definition
            const reader = readerOrDefinition as ITsReader;
            const typeReader = new TsTypeParser(reader);
            this.definition = typeReader.readTypeDeclaration();
        }
        this.baseType = new TsTypeBase(this.definition, false);
        this.name = this.baseType.typeName;
    }

    public getRequiredProperties(): ITsProperty[] {
        return this.baseType.properties?.filter(p => !p.isOptional) ?? [];
    }

    public toOpenApi(gatherer: IOpenApiGather, asRef = false) {
        if (!asRef) {
            return this.baseType.toOpenApi(gatherer, p => p.toOpenApi(gatherer));
        } else {
            const baseOADefinition = { $ref: `#/components/schemas/${this.typeName}` };
            if (this.baseType.isArray) {
                return { type: 'array', items: baseOADefinition };
            }
            return baseOADefinition;
        }
    }

    public static readonly String = new TsType('string');
    public static readonly Any = new TsType('object');

    [util.inspect.custom]() {
        return {
            type: this.typeName,
            properties: this.properties,
            base: this.baseType,
        }
    }
}