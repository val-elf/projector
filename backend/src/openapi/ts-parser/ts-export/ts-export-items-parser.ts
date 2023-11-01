import { TsParserBase } from "../ts-readers";
import { ETsEntitySymbolTypes, ITsParser, TReadEntityResult } from "../ts-readers/model";
import { TsExportItem } from "./ts-export-definition";

class TsExportItemImpl extends TsExportItem {
}

export class TsExportItemsParser extends TsParserBase {

    public static readExportItems(parent: ITsParser): TsExportItem[] {
        try {
            console.group('TS Export items reading start');
            const parser = new TsExportItemsParser(parent);
            return parser.readExportItems();
        } finally {
            console.groupEnd();
        }
    }

    private readExportItems(): TsExportItem[] {
        const result: TsExportItem[] = [];
        while(true) {
            if (this.readEntity(result) === null) break;
        }
        return result;
    }

    private mode: 'read' | 'read-alias' = 'read';

    protected override analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, items: TsExportItem[]): TReadEntityResult {
        // console.log('Reading export item', entity, entityType, this.mode);
        switch(entityType) {
            case ETsEntitySymbolTypes.From:
            case ETsEntitySymbolTypes.Semicolon:
                return null;
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                if (this.mode !== 'read-alias') {
                    const exportItem = new TsExportItemImpl();
                    exportItem.name = entity;
                    items.push(exportItem);
                } else {
                    const lastItem = items[items.length - 1];
                    lastItem.alias = entity;
                }
                this.mode = 'read';
                break;
            case ETsEntitySymbolTypes.As:
                this.index += entity.length;
                this.mode = 'read-alias';
                break;
            case ETsEntitySymbolTypes.Asterisk:
                this.index += entity.length;
                const asteriskItem = new TsExportItemImpl();
                asteriskItem.name = '*';
                items.push(asteriskItem);
                break;
            case ETsEntitySymbolTypes.OpenBrace:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.CloseBrace:
                this.index += entity.length;
                return null;

        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (entity === '*') return ETsEntitySymbolTypes.Asterisk;
        if (entity === 'as') return ETsEntitySymbolTypes.As;
        if (entity === 'from') return ETsEntitySymbolTypes.From;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}