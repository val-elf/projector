import { ITsParser } from '~/openapi/ts-parser/ts-readers/model';
import { TsProperty, TsPropertyParser } from '../../ts-property';
import { TsDecorator } from '~/openapi/ts-parser/ts-decorator';
import { TsParserBase } from '~/openapi/ts-parser/ts-readers/ts-parser-base';

export class TsInterfaceProperty extends TsProperty {
    public readonly isReadonly: boolean;
    public readonly isOptional: boolean;
    public readonly decorators?: TsDecorator[];

    constructor(name: string);
    constructor(
        reader: ITsParser,
        name: string,
        isReadonly: boolean,
        isOptional: boolean,
        decorators?: TsDecorator[]
    );
    constructor(
        readerOrName: string | ITsParser,
        name?: string,
        isReadonly?: boolean,
        isOptional?: boolean,
        decorators?: TsDecorator[]
    ) {
        if (typeof readerOrName === "string") {
            super(readerOrName as string);
        } else {
            console.log('Read property parser for property', name);
            const reader = new TsPropertyParser(readerOrName as TsParserBase);
            super(name);
            this.isReadonly = isReadonly;
            this.isOptional = isOptional;
            this.decorators = decorators;
            this.propertyType = reader.propertyType;
        }
    }
}