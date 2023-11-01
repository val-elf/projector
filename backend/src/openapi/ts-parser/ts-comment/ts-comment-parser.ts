import { IOADefinition } from "~/openapi/components/model";
import { ITsEntity } from "../model";
import { TsParserBase } from "../ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "../ts-readers/model";
import { ETsCommentType, TsComment } from "./ts-comment";
import { CommonOADefinition } from "~/openapi/components";

const COMMENT_LOCKER = Symbol('COMMENT_LOCKER');

export class TsCommentParser extends TsParserBase {

    public static readComment(parent: ITsParser) {
        const parser = new TsCommentParser(parent);
        return parser.readComment();
    }

    constructor(parent: ITsParser) {
        super(parent);
    }

    private readComment(): ITsEntity | IOADefinition {
        let result: TsComment | IOADefinition;

        const entity = this.readEntity() as TsComment;
        if (entity === null) return null;
        if (entity.isOA) {
            const comments: TsComment[] = [entity];
            while(true) {
                const line = this.readEntity() as (TsComment | null);
                if (line === null || line.isOA) {
                    if (line?.isOA) this.unlock(COMMENT_LOCKER);
                    else this.apply(COMMENT_LOCKER);
                    break;
                }
                this.apply(COMMENT_LOCKER);
                comments.push(line as TsComment);
            }
            const definition = CommonOADefinition.getDefinitionFromComments(comments);
            result = definition.getOAEntity();
        } else {
            result = entity;
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, ...additionalArguments: any[]): ITsEntity {
        const result = super.analyseEntity(entity, entityType, ...additionalArguments);
        if (result) return result;

        switch(entityType) {
            case ETsEntitySymbolTypes.Comment: {
                let commentType = entity === '//' ? ETsCommentType.SingleLine: ETsCommentType.MultiLine;
                const endComent = commentType === ETsCommentType.MultiLine ? /\*\// : /(\n|$)/;
                if (commentType === ETsCommentType.SingleLine) {
                    this.lock(COMMENT_LOCKER);
                }
                const commentText = this.expectOf(endComent, false).trim();
                return new TsComment(commentText, commentType);
            }
        }
        return null;
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        if (
            entity.startsWith('/*') ||
            entity.startsWith('//')
        ) return ETsEntitySymbolTypes.Comment;
    }
}