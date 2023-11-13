import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser, TReadEntityResult } from "~/openapi/ts-parser/ts-readers/model";
import { TsExpression } from "../ts-expression";
import { TsExpressionParser } from "./ts-expression-parser";
import { TsExpressionArray } from "../ts-expression-array";

export class TsExpressionArrayParser extends TsParserBase {

    public static readArrayExpression(parent: ITsParser): TsExpressionArray {
        try {
            console.group('Read Array Expression');
            const parser = new TsExpressionArrayParser(parent);
            return parser.readArrayExpression();
        } finally {
            console.groupEnd();
        }
    }

    private readArrayExpression(): TsExpressionArray {
        const items: TsExpression<unknown>[] = []
        while (true) {
            const entity = this.readEntity();
            if (entity === null) break;
            if (entity instanceof TsExpression) items.push(entity);
        }
        const result = new TsExpressionArray(items);
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): TReadEntityResult {
        switch(entityType) {
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.CloseSquareBracket:
                return null;
            default:
                return TsExpressionParser.readExpression(this);
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;
        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}