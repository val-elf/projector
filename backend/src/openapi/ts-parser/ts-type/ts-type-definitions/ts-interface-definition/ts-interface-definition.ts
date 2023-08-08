import { OATag } from '~/openapi/components';
import { ITsTagged } from '../../../model';
import { TsDecorator } from '../../../ts-decorator';
import { TsBaseTypeDefinition } from '../ts-base-type-definition';
import { ITsReader } from '../../../ts-readers/model';
import { ITsProperty } from '../../ts-property';
import { TsType } from '../..';

export class TsInterfaceDefinition extends TsBaseTypeDefinition implements ITsTagged {
    private extendsTypes: string[];
    public isGeneric: boolean;
    private genericTypes: string[];
    tag?: OATag;

    constructor(
        reader: ITsReader,
        isExport: boolean,
        decorators?: TsDecorator[],
    ) {
        super(reader, isExport, decorators);
    }

    public get typeName(): string {
        return 'object';
    }

    private mapExtenedPropertyToType(propertyType: string): TsBaseTypeDefinition | undefined {
        let schema = this._contextGatherer?.findSchema(propertyType);
        if (schema) {
            return schema.entity;
        }
        const type = new TsType(propertyType);
        if (
            type.isGeneric &&
            ['Partial', 'Promise'].includes(type.genericType.primitiveType)
        ) {
            return this._contextGatherer.findType(type.genericParameters[0].typeName);
        }
        if (!this._contextGatherer) {
            throw new Error('Gatherer is undefined for');
        }
        const exisingType = this._contextGatherer.findType(propertyType);
        if (exisingType) {
            return exisingType;
        }
        console.warn(`Cannot find schema for type ${propertyType}`);
    }

    protected read(reader: ITsReader) {
        const typeDefinition = reader.expectOf('{', true);
        const body = reader.restoreCode(reader.readToBalanced('}'));
        if (typeDefinition && body) {
            this.parseDefinition(typeDefinition);
            this.parseBody(body);
        }
    }

    protected get properties(): ITsProperty[] {
        const properties = [...super.properties];

        if (this.extendsTypes) {
            this.extendsTypes.forEach(extendsType => {
                const type = this.mapExtenedPropertyToType(extendsType);
                if (type) {
                    properties.push(...((type as any).properties as ITsProperty[]));
                }
            });
        }
        return properties;
    }

    private parseDefinition(definition: string) {
        const match = definition.match(/^interface\s+([^<]+?)(<(.+?)>)?(extends\s+(.+))?\s*$/);
        if (match) {
            this.name = match[1].trim();
            this.isGeneric = !!match[2];
            this.genericTypes = match[3]?.split(',').map(t => t.trim()) ?? [];
            this.extendsTypes = match[5]?.split(',').map(t => t.trim()) ?? [];
        }
    }

    private parseBody(body: string) {
        this._type = new TsType(body);
    }
}