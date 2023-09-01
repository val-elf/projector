import { ITsParser } from '../../ts-readers/model';
import { TsDecorator } from '../../ts-decorator';
import { TsBaseTypeDefinition } from './ts-base-type-definition';
import { TsType } from '../ts-type';
import util from 'util';
import { IOpenApiGather } from '~/openapi/components/model';

export class TsTypeDefinition extends TsBaseTypeDefinition {
    private isGeneric: boolean = false;
    private genericTypes: string[] = [];

    constructor(
        reader: ITsParser,
        isExport: boolean,
        decorators?: TsDecorator[],
    ) {
        super(reader, isExport, decorators);
    }

    public get typeName(): string {
        const dectype = this.data.properties['type'] as string;
        let baseType = 'object';
        return dectype ?? 'object';
    }

    protected read(reader: ITsParser) {
        const typeDefinition = reader.expectOf('=', true);
        reader.move(1); // move over '=' sign;
        this._type = new TsType(reader);
        if (typeDefinition) {
            this.parseDefinition(typeDefinition);
        }
    }

    private parseDefinition(definition: string) {
        const match = definition.match(/^type\s+([^<]+?)(<(.+?)>)?\s*$/);
        if (match) {
            this.name = match[1].trim();
            this.isGeneric = !!match[2];
            this.genericTypes = match[3]?.split(',').map(t => t.trim()) ?? [];
        }
    }

    [util.inspect.custom]() {
        return {
            name: this.name,
            isExport: this.isExport,
            isGeneric: this.isGeneric,
            body: this._type,
        }
    }
}
