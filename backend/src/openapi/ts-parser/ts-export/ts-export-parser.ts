import { ITsEntity } from "../model"
import { TsClassParser } from "../ts-types/ts-type-definitions/ts-class-definition/parsers/ts-class-parser";
import { TsEnumParser } from "../ts-types/ts-type-definitions/ts-enum-definition/parsers/ts-enum-parser";
import { TsInterfaceParser } from "../ts-types/ts-type-definitions/ts-interface-definition/parsers/ts-interface-parser";
import { TsTypeDefinitionParser } from "../ts-types/ts-type-definitions/ts-type-definition/ts-type-definition-parser";
import { TsVariableParser } from "../ts-variable/ts-variable-parser";
import { ETsEntitySymbolTypes } from "../ts-readers/model"
import { TsParserBase } from "../ts-readers/ts-parser-base"
import { TsExportDefinitionParser } from "./ts-export-definition-parser";

export class TsExportParser extends TsParserBase {

    public static readExportDefinition(parser: TsParserBase): ITsEntity {
        try {
            console.group('Read export definition');
            const exportParser = new TsExportParser(parser);
            return exportParser.readExportDefinition();
        } finally {
            console.groupEnd();
        }
    }

    private readExportDefinition(): ITsEntity {
        const container = { result: null };
        this.readEntity(container);
        return container.result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, container: { result: ITsEntity }): ITsEntity {
        // console.log('Ts Export expression reading entity:', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.Export:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Asterisk:
            case ETsEntitySymbolTypes.EntityName:
            case ETsEntitySymbolTypes.OpenBrace:
                container.result = TsExportDefinitionParser.readExportDefinition(this);
                return null;
            case ETsEntitySymbolTypes.Type:
                container.result = TsTypeDefinitionParser.readTypeDefinition(this, true);
                return null;
            case ETsEntitySymbolTypes.Interface:
                container.result = TsInterfaceParser.readInterfaceDefinition(this, true);
                return null;
            case ETsEntitySymbolTypes.Variable:
                container.result = TsVariableParser.readVariable(this, true);
                return null;
            case ETsEntitySymbolTypes.Class:
                container.result = TsClassParser.readClassDefinition(this, true, false);
                return null;
            case ETsEntitySymbolTypes.Enum:
                container.result = TsEnumParser.readEnumDefinition(this, true);
                return null;
            case ETsEntitySymbolTypes.Semicolon:
                return container.result;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === '*') return ETsEntitySymbolTypes.Asterisk;
        if (entity === 'const' || entity === 'let' || entity === 'var') return ETsEntitySymbolTypes.Variable;
        if (entity === 'class') return ETsEntitySymbolTypes.Class;
        if (entity === 'interface') return ETsEntitySymbolTypes.Interface;
        if (entity === 'enum') return ETsEntitySymbolTypes.Enum;
        if (entity === 'type') return ETsEntitySymbolTypes.Type;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}