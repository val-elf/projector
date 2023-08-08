import { TsCodeBlock } from '../ts-code-block';
import { TsExpression } from '../ts-expression';
import { ETsEntityTypes, TsEntity } from './model';
import { TsParserBase } from './ts-parser-base';

export class TsArrowFunctionParser extends TsParserBase {

    protected analyseEntity(entity: string, entityType: any): TsEntity | ETsEntityTypes {
        const entityResult = super.analyseEntity(entity, entityType);
        if (entityResult) return entityResult;

        switch(entityType) {
            case ETsEntityTypes.OpenBrace: // this function has body
                return new TsCodeBlock(this);
            case ETsEntityTypes.OpenParenthesis: // this function has return type as object
                const expressionBody = this.readToBalanced(')', true);
                return new TsExpression(expressionBody);
            default:
                    // this is look like expression arrow function
                break;
        }
    }

    protected defineEntityType(entity: string): ETsEntityTypes {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        switch(entity) {
            case '{':
                return ETsEntityTypes.OpenBrace;
            case '}':
                return ETsEntityTypes.CloseBrace;
            case '(':
                return ETsEntityTypes.OpenParenthesis;
            case ')':
                return ETsEntityTypes.CloseParenthesis;
        }
    }

}