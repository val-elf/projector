import { ETsEntityTypes } from '../ts-readers/model';
import { TsEntity } from '../model';
import { EDeclarationType } from '~/openapi/components/model';

import util from "util";

export enum ETsCommentType {
    SingleLine = '//',
    MultiLine = '/*'
}

export class TsComment extends TsEntity {
    public readonly entityType = ETsEntityTypes.Comment;

    public readonly lines: string[] = [];
    public readonly indents: number[] = [];
    public readonly comment: string;
    public readonly commentType: ETsCommentType;

    public get isOA() {
        return this.lines[0].startsWith('@OA:');
    }

    public get OAType(): EDeclarationType {
        return this.lines[0].replace('@OA:', '').trim() as EDeclarationType;
    }

    constructor(
        comment?: string,
        commentType?: ETsCommentType
    ) {
        super('');
        if (arguments.length === 0) {
            this.comment = '';
            this.commentType = ETsCommentType.SingleLine;
        } else {
            this.comment = comment;
            this.commentType = commentType
        }

        this.comment = comment;
        this.commentType = commentType;
        if (this.commentType === ETsCommentType.MultiLine) {
            this.lines = this.comment.replace(/(^\/\*|\*\/$)/g, '')
                .split('\n')
            ;
        } else {
            this.lines = [this.comment.replace(/^\/\//, '')];
        }
        this.indents = this.lines.map(l => l.match(/^\s*/)[0].length);
        this.lines = this.lines.map(l => l.trim());
    }

    public getLineIndent(line: number) {
        return this.indents[line];
    }

    [util.inspect.custom](depth: number, options: any): any {
        return { comment: `${this.lines.join('\n')}`, linesCount: this.lines.length };
    }
}