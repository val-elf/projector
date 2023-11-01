import { ITsEntity } from "../../../model";
import { TsParserBase } from "../../../ts-readers";
import { ETsEntitySymbolTypes } from "../../../ts-readers/model";
import { TsExpression } from "../../ts-expressions";
import { TsExpressionParser } from "../../ts-expressions/parsers/ts-expression-parser";
import { TsArgumentsList } from "../ts-arguments";

export class TsArgumentsListParser extends TsParserBase {

    public static readArgumentsList(parent: TsParserBase): TsArgumentsList {
        try {
            console.group('Read Arguments List');
            const parser = new TsArgumentsListParser(parent);
            return parser.readArgumentsList();
        } finally {
            console.log('Read Arguments List finished');
            console.groupEnd();
        }
    }

    private readArgumentsList(): TsArgumentsList {
        const result = new TsArgumentsList();
        while (true) {
            const entity = this.readEntity();
            if (entity === null) break;
            if (entity instanceof TsExpression) result.addArgument(entity);
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, ...additionalArguments: any[]): ITsEntity {
        const result = super.analyseEntity(entity, entityType, ...additionalArguments);
        if (result) return result;

        switch(entityType) {
            case ETsEntitySymbolTypes.ArgumentStart:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.ArgumentEnd:
                return null;
            default:
                return TsExpressionParser.readExpression(this);
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (entity === ')') return ETsEntitySymbolTypes.ArgumentEnd;
        if (entity === '(') return ETsEntitySymbolTypes.ArgumentStart;
    }
}