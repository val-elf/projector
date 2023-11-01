import { TsParserBase } from '../ts-readers';
import { ETsEntitySymbolTypes, TReadEntityResult } from '../ts-readers/model';
import { TsExportDefinition } from './ts-export-definition';
import { TsExportItemsParser } from './ts-export-items-parser';

class TsExportDefinitionImpl extends TsExportDefinition {
}

export class TsExportDefinitionParser extends TsParserBase {

    public static readExportDefinition(parent: TsParserBase): TsExportDefinition {
        try {
            console.group('TS Export definition reading start');
            const parser = new TsExportDefinitionParser(parent);
            return parser.readExportDefinition();
        } finally {
            console.groupEnd();
        }
    }

    private readExportDefinition(): TsExportDefinition {
        const result = new TsExportDefinitionImpl();
        this.readEntity(result);
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, result: TsExportDefinitionImpl): TReadEntityResult {
        // console.log('Entity while export definition reading', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.From:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.String:
                const exportPath = this.readString();
                result.exportPath = exportPath;
                break;
            case ETsEntitySymbolTypes.EntityName:
            case ETsEntitySymbolTypes.Asterisk:
            case ETsEntitySymbolTypes.OpenBrace:
                result.exportItems = TsExportItemsParser.readExportItems(this);
                break;
            case ETsEntitySymbolTypes.Semicolon:
                return null;
        }
        return;
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === '*') return ETsEntitySymbolTypes.Asterisk;
        if (entity === 'from') return ETsEntitySymbolTypes.From;
        if (entity === '"') return ETsEntitySymbolTypes.String;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}