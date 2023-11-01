import { TsCommentParser } from "../ts-comment/ts-comment-parser";
import { ETsEntitySymbolTypes, TReadEntityResult } from "./model";
import { TsParserBase } from "./ts-parser-base";

export abstract class TsBaseCommentParser extends TsParserBase {
    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, ...additionalArguments: any[]): TReadEntityResult {
        const result = super.analyseEntity(entity, entityType, ...additionalArguments);
        if (result) return result;
        switch(entityType) {
            case ETsEntitySymbolTypes.Comment:
                const comment = TsCommentParser.readComment(this);
                // console.log('REading comment', comment);
                return comment;
        }
    }
}