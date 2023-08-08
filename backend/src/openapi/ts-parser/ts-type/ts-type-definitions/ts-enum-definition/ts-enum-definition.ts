import { IOpenApiGather } from '~/openapi/components/model';
import { TsDecorator } from '../../../ts-decorator';
import { ITsReader } from '../../../ts-readers/model';
import { TsBaseTypeDefinition } from '../ts-base-type-definition';
import { TsEnumProperty } from './ts-enum-property';
import { ITsProperty } from '../../ts-property';

export class TsEnumDefinition extends TsBaseTypeDefinition {

    protected propertyKeyName = 'enum';
    private  _properties: TsEnumProperty[];

    public get properties(): ITsProperty[] {
        return this._properties;
    }

    constructor(
        reader: ITsReader,
        isExport: boolean,
        decorators?: TsDecorator[],
    ) {
        super(reader, isExport, decorators);
    }

    public get typeName(): string {
        return 'enum';
    }

    protected read(reader: ITsReader) {
        const typeDefinition = reader.expectOf('{', true);
        const body = reader.restoreCode(reader.readToBalanced('}', true));
        if (typeDefinition && body) {
            this.parseDefinition(typeDefinition);
            this.parseBody(body);
        }
    }

    private parseDefinition(definition: string) {
        const match = definition.match(/^enum\s+(.+)$/);
        if (match) {
            this.name = match[1].trim();
        }
    }

    private parseBody(body: string) {
        const items = body
            .replace(/(^\s*{|}\s*$)/g, '')
            .split(',')
            .map(i => i.trim())
        ;
        this._properties = items.map(item => {
                const match = item.match(/^(.+?)\s*(=\s*(.+?))?\s*$/);
                if (match) {
                    const value = match[3] ? match[3].trim().replace(/(^['"`]|['"`]$)/g, '') : undefined;
                    return new TsEnumProperty(match[1], value);
                }
            })
            .filter(i => i)
        ;
    }
}

