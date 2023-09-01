import { TsCodeBlock } from '../../ts-code-block';
import { TsExpression } from '../../ts-expression';
import { ETsEntitySymbolTypes, TReadEntityResult } from '../../ts-readers/model';
import { TsParserBase } from '../../ts-readers/ts-parser-base';

export class TsArrowFunctionParser extends TsParserBase {

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): TReadEntityResult {
        const entityResult = super.analyseEntity(entity, entityType);
        if (entityResult) return entityResult;

        switch(entityType) {
            case ETsEntitySymbolTypes.OpenBrace: // this function has body
                return new TsCodeBlock(this);
            case ETsEntitySymbolTypes.OpenParenthesis: // this function has return type as object
                const expressionBody = this.readToBalanced(')', true);
                return new TsExpression(expressionBody);
            default:
                    // this is look like expression arrow function
                break;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        switch(entity) {
            case '{':
                return ETsEntitySymbolTypes.OpenBrace;
            case '}':
                return ETsEntitySymbolTypes.CloseBrace;
            case '(':
                return ETsEntitySymbolTypes.OpenParenthesis;
            case ')':
                return ETsEntitySymbolTypes.CloseParenthesis;
        }
    }

}