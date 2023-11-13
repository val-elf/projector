import { TsDecoratorParser } from "../ts-decorator/ts-decorator-parser";
import { ETsEntitySymbolTypes, TReadEntityResult } from "./model";
import { TsBaseCommentParser } from "./ts-base-comment-parser";

export abstract class TsBaseDecoratorParser extends TsBaseCommentParser {

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, ...additionalArguments: any[]): TReadEntityResult {
        const result = super.analyseEntity(entity, entityType, ...additionalArguments);
        if (result) return result;

        switch(entityType) {
            case ETsEntitySymbolTypes.Decorator:
                return TsDecoratorParser.readDecorator(this);
        }
    }
}