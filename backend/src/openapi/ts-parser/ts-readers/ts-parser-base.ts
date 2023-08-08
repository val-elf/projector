import { getBalancedEnd } from '../../utils';
import { TsComment } from '../ts-comment';
import { TsDecorator } from '../ts-decorator';
import { TsImport } from '../ts-import';
import { ETsEntityTypes, ITsReader, TAttributes, TsEntity } from './model';
import util from "util";

enum EQuoteCode {
    Single = 39,
    Double = 34,
    Backtick = 96,
}

const SPECIAL_CHARS = ['!', '@', '^', '&', '*', '(', ')', '-', '+', '[', ']', '{', '}', ';', ':', ',', '.', '?', '<', '>', '|', '\\'];

export abstract class TsParserBase implements ITsReader {
    private _index: number = 0;
    protected get index(): number {
        return this._index;
    }

    protected set index(value: number) {
        const delta = value - this._index;
        this._index = value;
        if (this.parent) {
            (this.parent as TsParserBase).index += delta;
        }
    }

    private lockers: number[] = [];

    private _strings: { [key: string]: string[] } = {};

    protected _code: string = '';
    protected parent?: ITsReader;

    private _lastEntity: { entity: string, entityType: ETsEntityTypes } ;
    public get lastEntity(): { entity: string, entityType: ETsEntityTypes } {
        return this._lastEntity;
    }


    protected get strings() {
        return (this.parent as TsParserBase)?.strings ?? this._strings;
    }

    protected get current(): string {
        return this._code.substring(this.index);
    }

    protected attributes: TAttributes = {};
    protected decorators: TsDecorator[] = [];

    public get code() {
        return this.restoreCode();
    }

    constructor(parent: ITsReader);
    constructor(code: string, parent?: ITsReader);
    constructor(...args: any[]) {
        if (typeof args[0] === "string") {
            this._code = args[0];
            this.parent = args[1];
        } else {
            this.parent = args[0];
            this._code = (this.parent as TsParserBase).current;
        }

        this._lastEntity = this.parent?.lastEntity;

        if (!this.parent) {
            this.prepareCode();
        }
    }

    public readEntity(needEntityType?: ETsEntityTypes): TsEntity | ETsEntityTypes | undefined {

        while (true) {
            const { entity, entityType } = this.readEntityFromCode() ?? {};

            this._lastEntity = { entity, entityType };

            if (needEntityType && entityType !== needEntityType) return;
            if (entity === undefined && entityType === undefined) return;

            const result = this.analyseEntity(entity, entityType);
            // we have to return only if result is defined
            if (result) {
                return result;
            }
        }
    }

    // Decorator, Comment and Abstract should not be processed in the child classes
    protected analyseEntity(entity: string, entityType): TsEntity | ETsEntityTypes | undefined {
        switch (entityType) {
            case ETsEntityTypes.Abstract:
                this.index += entity.length;
                this.attributes.isAbstract = true;
                break;
            case ETsEntityTypes.Comment:
                return new TsComment(this);
            case ETsEntityTypes.Decorator:
                this.decorators.push(new TsDecorator(this));
                break;
            default:
                return;
        }
    }

    protected readEntityFromCode(): { entity: string, entityType: ETsEntityTypes | undefined } {
        while(/\s/.test(this.current.charAt(0))) {
            this.index++;
        }
        let entity;
        let entityType;
        const charat = this.current.charAt(0);

        if (SPECIAL_CHARS.includes(charat)) {
            entity = charat;
        } else {
            const reg = /\w/.test(charat) ? /(\w+)/ : /([^\s]+)/;
            const read = this.current.match(reg);
            if (!read) return;
            entity = read[1];
        }
        entityType = this.defineEntityType(entity);
        return {entity, entityType };
    }

    public expectOf(chars: RegExp, exclude: boolean): string | undefined;
    public expectOf(chars: string, exclude: boolean): string | undefined;
    public expectOf(charsOrReg: RegExp | string, exclude: boolean = false): string | undefined {
        let index;
        let count = 0;
        if (charsOrReg instanceof RegExp) {
            const rexp = charsOrReg as RegExp;
            const read = this.current.match(rexp);
            if (!read) return;
            index = read.index;
            count = read[0].length;
        } else {
            const chars = charsOrReg as string;
            index = this.current.indexOf(chars);
            count = chars.length;
        }

        if (index > -1) {
            const exlength = exclude ? 0 : count;
            const result = this.current.substring(0, index + exlength);
            this.index += index + exlength;
            return result;
        }
    }

    public readToBalanced(rlimit: string, inside = false): string | undefined {
        const llimit = this.current.charAt(0);
        const bindex = getBalancedEnd(this.current, [llimit, rlimit]);
        if (bindex > -1) {
            const start = inside ? 1 : 0;
            const end = inside ? bindex : bindex + 1;
            const result = this.current.substring(start, end);
            this.index += bindex + 1;
            return result;
        }
    }

    public readToEnd(): string {
        const result = this.current;
        this.index += result.length;
        return result;
    }

    public move(index: number): void {
        this.index += index;
    }

    public readString(count: number) {
        return this.current.substring(0, count);
    }

    protected defineEntityType(entity: string): ETsEntityTypes | undefined {
        if (entity === 'import') return ETsEntityTypes.Import;
        if (entity === 'function') return ETsEntityTypes.Function;
        if (entity === '=>') return ETsEntityTypes.ArrowFunction;
        if (entity === '=') return ETsEntityTypes.Assignment;
        if (entity === ':') return ETsEntityTypes.TypeDefinition;
        if (entity === 'async') return ETsEntityTypes.Async;
        if (/^\/\*/.test(entity)) return ETsEntityTypes.Comment;
        if (entity === '//') return ETsEntityTypes.Comment;
        if (entity === 'abstract') return ETsEntityTypes.Abstract;
        if (entity.startsWith('@')) return ETsEntityTypes.Decorator;
        if (entity.startsWith('(')) return ETsEntityTypes.Argument;
        if (entity.startsWith('[')) return ETsEntityTypes.OpenSquareBracket;
        if (entity.startsWith(']')) return ETsEntityTypes.CloseSquareBracket;
    }

    private prepareCode() {
        // first, remove all comments;
        const comments = this.removeComments();

        // replace all string to the coded strings;
        ['"', "'", '`'].forEach(quote => this.replaceStringWith(quote));

        // then restore all comments;
        this.restoreComments(comments);
    }

    private removeComments() {
        const comments: { [key: string]: string } = {};
        let counter = 0;
        while(true) {
            let cindex = this._code.indexOf('/*');
            if (cindex > -1) {
                let eindex = this._code.indexOf('*/', cindex);
                if (eindex === -1) eindex = this._code.length; else eindex += 2;
                const commentText = this._code.substring(cindex, eindex);
                const commentKey = `\x01_${counter}`;
                comments[counter] = commentText;
                this._code = this._code.substring(0, cindex) + commentKey + this._code.substring(eindex);
                counter ++;
                continue;
            }
            cindex = this._code.indexOf('//');
            if (cindex > -1) {
                let eindex = this._code.indexOf('\n', cindex);
                if (eindex === -1) eindex = this._code.length;
                const commentText = this._code.substring(cindex, eindex);
                const commentKey = `\x02_${counter}`;
                comments[counter] = commentText.trim();
                this._code = this._code.substring(0, cindex) + commentKey + this._code.substring(eindex);
                counter ++;
                continue;
            }
            break;
        }
        return comments;
    }

    private restoreComments(comments: any) {
        const ckeys = Object.keys(comments);
        ckeys.forEach((key) => {
            const commentAKey = `\x01_${key}`;
            const commentBKey = `\x02_${key}`;
            const indexA = this._code.indexOf(commentAKey);
            const indexB = this._code.indexOf(commentBKey);
            if (indexA > -1) {
                this._code = this._code.replace(commentAKey, comments[key]);
                return;
            }
            if (indexB > -1) {
                this._code = this._code.replace(commentBKey, comments[key]);
                return;
            }
        });
    }

    public restoreCode(source?: string): string {
        // restore all coded strings to the original strings;
        let code = source ?? this._code;
        return ['"', "'", '`'].reduce((res, quote) => this.restoreStringWith(quote, res), code);
    }

    protected restoreStringWith(quote: string, code: string) {
        const quoteCode = quote.charCodeAt(0) as EQuoteCode;
        this.strings[quoteCode]?.forEach((string, index) => {
            const codeIndex = new RegExp(`"__${quoteCode}:${index}__"`, 'g');
            code = code.replace(codeIndex, string);
        });
        return code;
    }

    private replaceStringWith(quote: string) {
        let { _code: code } = this;
        let index = 0;
        const quoteCode = quote.charCodeAt(0) as EQuoteCode;
        this.strings[quoteCode] = [];
        while (true) {
            const start = code.indexOf(quote, index);
            if (start === -1) break;
            let end = start;
            while(true) {
                end = code.indexOf(quote, end + 1);
                if (code.charAt(end - 1) === '\\') continue;
                break;
            }

            if (end === -1) break;

            const string = code.substring(start, end + 1);
            const codeIndex = this.strings[quoteCode].push(string) - 1;
            const codeSign = `"__${quoteCode}:${codeIndex}__"`;
            code = code.substring(0, start) + codeSign + code.substring(end + 1);
            index = start + codeSign.length + 1;
        }
        this._code = code;
    }

    lock() {
        this.lockers.push(this.index);
    }

    unlock() {
        if (this.lockers.length) {
            this.index = this.lockers.pop() || 0;
        }
    }

    apply() {
        this.lockers.pop();
    }

    protected extractParameters(): any {
        const { attributes, decorators } = this;
        this.attributes = {};
        this.decorators = [];
        return { attributes, decorators };
    }

    [util.inspect.custom]() {
        return {
            type: this.constructor.name,
            index: this.index,
            current: this.current
        }
    }
}
