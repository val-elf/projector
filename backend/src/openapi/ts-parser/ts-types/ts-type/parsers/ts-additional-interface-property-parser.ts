import { ITsEntity } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { TsAddtitionalInterfaceProperty } from "../../ts-type-definitions/ts-interface-definition/ts-additional-interface-property";
import { ITsType } from "../../model";
import { TsTypeParser } from "./ts-type-parser";
import { TsTypeService } from "~/openapi/services/ts-type.service";

enum EReaderModes {
    initial = 'initial',
    keyName = 'key-name',
    keyType = 'key-type',
    propertyType = 'property-type'
}

export class TsAddtitionalInterfacePropertyParser extends TsParserBase {
    private draftProperty: {
        keyName: string;
        keyType?: ITsType;
        propertyType?: ITsType;
    } = {
        keyName: '',
        keyType: TsTypeService.String,
        propertyType: TsTypeService.Any
    };

    private readMode: EReaderModes = EReaderModes.initial;

    public static readAdditionalInterfaceProperty(parser: ITsParser): TsAddtitionalInterfaceProperty {
        try {
            console.group('Read additional interface property:');
            const reader = new TsAddtitionalInterfacePropertyParser(parser);
            return reader.readEntity() as TsAddtitionalInterfaceProperty;
        } finally {
            console.groupEnd();
        }
    }

    protected override analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): ITsEntity {
        let eResult = super.analyseEntity(entity, entityType);
        if (eResult) return eResult;

        switch(entityType) {
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                if (this.readMode === EReaderModes.keyName) {
                    this.readMode = EReaderModes.keyType;
                } else this.readMode = EReaderModes.propertyType;
                break;
            case ETsEntitySymbolTypes.OpenSquareBracket:
                this.index += entity.length;
                this.readMode = EReaderModes.keyName;
                break;
            case ETsEntitySymbolTypes.CloseSquareBracket:
                this.index += entity.length;
                this.readMode = EReaderModes.initial;
                break;
            case ETsEntitySymbolTypes.EntityName: {
                switch (this.readMode) {
                    case EReaderModes.keyName:
                        this.index += entity.length;
                        this.draftProperty.keyName = entity;
                        break;
                    case EReaderModes.keyType:
                        this.draftProperty.keyType = TsTypeParser.readType(this);
                        break;
                    case EReaderModes.propertyType: // this is the finish of the reading additional property
                        this.draftProperty.propertyType = TsTypeParser.readType(this);
                        const { keyName, propertyType, keyType } = this.draftProperty;
                        return new TsAddtitionalInterfaceProperty(keyName, keyType, propertyType);
                }
                break;
            }
        }
    }

    protected override defineEntityType(entity: string): ETsEntitySymbolTypes | undefined{
        if (entity === ':') return ETsEntitySymbolTypes.TypeDefinition;
        if (entity === '[') return ETsEntitySymbolTypes.OpenSquareBracket;
        if (entity === ']') return ETsEntitySymbolTypes.CloseSquareBracket;
        if (/^\w+$/.test(entity.trim())) return ETsEntitySymbolTypes.EntityName;
    }
}