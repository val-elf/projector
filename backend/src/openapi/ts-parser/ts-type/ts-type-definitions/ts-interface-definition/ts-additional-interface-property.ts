import { ITsReader } from '~/openapi/ts-parser/ts-readers/model';
import { TsProperty } from '../../ts-property';
import { TsDecorator } from '~/openapi/ts-parser/ts-decorator';
import { TsType } from '../../ts-type';
import { TsParserBase } from '~/openapi/ts-parser/ts-readers/ts-parser-base';
import { IOpenApiGather } from '~/openapi/components/model';

class AdditionalPropertyParser extends TsParserBase {

    private _propertyName: string = 'key';
    private _propertyKeyType: TsType = TsType.String;
    private _propertyType: TsType = TsType.Any;

    public get propertyName(): string {
        return this._propertyName;
    }

    public get propertyType(): TsType {
        return this._propertyType;
    }

    constructor(reader: ITsReader) {
        super(reader);
        this.readProperty(reader);
    }

    private readProperty(reader: ITsReader) {
        // key part read
        const keyPart = reader.readToBalanced(']', true);
        reader.expectOf(':');
        let typePart = reader.expectOf(/[;\n\r]/);
        if (!typePart) typePart = reader.readToEnd();
        this._propertyType = new TsType(typePart);

        const keyParts = keyPart.split(':');
        if (keyParts.length === 2) {
            this._propertyName = keyParts[0];
            this._propertyKeyType = new TsType(keyParts[1]);
        }
    }
}

export class TsAddtitionalInterfaceProperty extends TsProperty {
    public readonly isReadonly: boolean;
    public readonly isOptional: boolean;
    public readonly decorators?: TsDecorator[];

    constructor(reader: ITsReader, decorators?: TsDecorator[]) {
        const parser = new AdditionalPropertyParser(reader);
        super(parser.propertyName);

        this.isReadonly = false;
        this.isOptional = false;
        this.decorators = decorators;
        this.propertyType = parser.propertyType;
    }

    public toOpenApi(gatherer: IOpenApiGather): { [key: string]: any; } {
        return this.propertyType.toOpenApi(gatherer);
    }
}