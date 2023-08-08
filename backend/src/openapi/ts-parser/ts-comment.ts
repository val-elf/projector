import { ETsEntityTypes, ITsReader, TsEntity } from './ts-readers/model';
import util from "util";

export enum ETsCommentType {
    SingleLine = '//',
    MultiLine = '/*'
}

export class TsComment extends TsEntity {
    public readonly lines: string[] = [];
    public readonly indents: number[] = [];
    public readonly type = ETsEntityTypes.Comment;
    public readonly comment: string;
    public readonly commentType: ETsCommentType;

    public get isOA() {
        return this.lines[0].startsWith('@OA:');
    }

    public get OAType() {
        return this.lines[0].replace('@OA:', '').trim();
    }

    constructor(reader: ITsReader);
    constructor(
        comment: string,
        commentType: ETsCommentType
    );
    constructor(...args: any[]) {
        super('', ETsEntityTypes.Comment);
        let comment: string;
        let commentType: ETsCommentType;
        if (args.length === 1) {
            const res = TsComment.read(args[0]);
            comment = res?.comment ?? '';
            commentType = res?.commentType ?? ETsCommentType.SingleLine;
        } else if (args.length === 2) {
            comment = args[0];
            commentType = args[1];
        }

        this.comment = comment;
        this.commentType = commentType;
        if (this.commentType === ETsCommentType.MultiLine) {
            this.lines = comment.replace(/(^\/\*|\*\/$)/g, '')
                .split('\n')
            ;
        } else {
            this.lines = [comment.replace(/^\/\//, '')];
        }
        this.indents = this.lines.map(l => l.match(/^\s*/)[0].length);
        this.lines = this.lines.map(l => l.trim());
    }

    public getLineIndent(line: number) {
        return this.indents[line];
    }

    private static read(parser: ITsReader): { comment: string, commentType: ETsCommentType } | undefined {
        const commentType: ETsCommentType = parser.readString(2) as ETsCommentType;
        const endComment = commentType === '//' ? '\n' : '*/';
        const comment = parser.expectOf(endComment);
        if (comment === undefined) return;
        return { comment, commentType };
    }

    [util.inspect.custom](depth: number, options: any): any {
        return { comment: `${this.lines.join('\n')}`, linesCount: this.lines.length };
    }
}