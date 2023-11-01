import { getBalancedEnd } from '../../utils';
import { ITsDecorator } from '../model';
import { ETsEntitySymbolTypes, ITsParser, LANGUAGE_KEYWORDS, TPropertyModifiers, TReadEntityResult } from './model';
import util from "util";

enum EQuoteCode {
    Single = 39,
    Double = 34,
    Backtick = 96,
}

const SPECIAL_CHARS = ['!', '@', '^', '&', '|', '/', '*', '(', ')', '\'', '"', '`', '-', '+', '[', ']', '{', '}', ';', ':', ',', '.', '?', '<', '>', '\\'];
const LONG_OPERATORS = ['!=', '==', '===', '+=', '-=', '*=', '/=', '%=', '>=', '<=', '&&', '||', '++','--', '=>', '??', '//', '/*', '*/', '...'];

interface ILocker {
    index: number;
    symbol: Symbol;
}
export abstract class TsParserBase implements ITsParser {
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

    private lockers: ILocker[] = [];

    private _strings: { [key: string]: string[] } = {};

    protected _code: string = '';
    protected parent?: ITsParser;

    private _lastEntity: { entity: string, entityType: ETsEntitySymbolTypes } ;
    public get lastEntity(): { entity: string, entityType: ETsEntitySymbolTypes } {
        return this._lastEntity;
    }

    protected get strings() {
        return (this.parent as TsParserBase)?.strings ?? this._strings;
    }

    protected get current(): string {
        return this._code.substring(this.index);
    }

    protected modifiers: TPropertyModifiers = {};
    protected decorators: ITsDecorator[] = [];

    public get code() {
        return this.restoreCode();
    }

    private entityTypesStack: ETsEntitySymbolTypes[] = [];

    protected get previousEntityType(): ETsEntitySymbolTypes | undefined {
        return this.entityTypesStack[this.entityTypesStack.length - 1];
    }

    private pushEntityTypeToStack(entityType: ETsEntitySymbolTypes) {
        this.entityTypesStack.push(entityType);
        while (this.entityTypesStack.length > 3) {
            this.entityTypesStack.shift();
        }
    }

    // constructor(parent: ITsParser);
    //constructor(code: string, parent?: ITsParser);
    constructor(parentOrCode: ITsParser | string, parent?: ITsParser) {
        if (typeof parentOrCode === "string") {
            this._code = parentOrCode;
            this.parent = parent;
        } else {
            this.parent = parentOrCode;
            this._code = (this.parent as TsParserBase).current;
        }

        this._lastEntity = this.parent?.lastEntity;

        if (!this.parent) {
            this.prepareCode();
        }
    }

    public readEntity(...additionalArguments: any[]): TReadEntityResult {

        while (true) {
            const { entity, entityType } = this.readEntityFromCode() ?? {};

            this._lastEntity = { entity, entityType };
            // console.log('Read entity (parser base):', entity, entityType);
            if (entity === undefined && entityType === undefined) {
                // console.log('Undefined entity reading from here: ', this.index, this.code.length, this.code.substring(this.index));
                return null;
            }
            // console.log('ETYPE', entityType, entity);

            const result = this.analyseEntity(entity, entityType, ...additionalArguments);
            this.pushEntityTypeToStack(entityType)
            // we have to return only if result is defined
            if (result || result === null) {
                return result;
            }
        }
    }

    // Decorator, Comment and Abstract should not be processed in the child classes
    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, ...additionalArguments: any[]): TReadEntityResult {
        switch (entityType) {
            case ETsEntitySymbolTypes.Abstract:
                this.index += entity.length;
                this.modifiers.isAbstract = true;
                break;
            case ETsEntitySymbolTypes.Async:
                this.index += entity.length;
                this.modifiers.isAsync = true;
                break;
            case ETsEntitySymbolTypes.Protected:
                this.index += entity.length;
                this.modifiers.accessModifier = ETsEntitySymbolTypes.Protected;
                break;
            case ETsEntitySymbolTypes.Private:
                this.index += entity.length;
                this.modifiers.accessModifier = ETsEntitySymbolTypes.Private;
                break;
            case ETsEntitySymbolTypes.Public:
                this.index += entity.length;
                this.modifiers.accessModifier = ETsEntitySymbolTypes.Public;
                break;
            case ETsEntitySymbolTypes.Static:
                this.index += entity.length;
                this.modifiers.isStatic = true;
                break;
            case ETsEntitySymbolTypes.Readonly:
                this.index += entity.length;
                this.modifiers.isReadonly = true;
                break;
            default:
                return;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        if (entity === 'import') return ETsEntitySymbolTypes.Import;
        if (entity === 'export') return ETsEntitySymbolTypes.Export;
        if (entity === 'function') return ETsEntitySymbolTypes.Function;
        if (entity === 'public') return ETsEntitySymbolTypes.Public;
        if (entity === 'private') return ETsEntitySymbolTypes.Private;
        if (entity === 'protected') return ETsEntitySymbolTypes.Protected;
        if (entity === 'static') return ETsEntitySymbolTypes.Static;
        if (entity === 'readonly') return ETsEntitySymbolTypes.Readonly;
        if (entity === 'async') return ETsEntitySymbolTypes.Async;
        if (entity === '=>') return ETsEntitySymbolTypes.ArrowFunction;
        if (entity === '=') return ETsEntitySymbolTypes.Assignment;
        if (entity === ':') return ETsEntitySymbolTypes.TypeDefinition;
        if (entity === ';') return ETsEntitySymbolTypes.Semicolon;
        if (entity === 'async') return ETsEntitySymbolTypes.Async;
        if (/^\/\*/.test(entity)) return ETsEntitySymbolTypes.Comment;
        if (entity === '//') return ETsEntitySymbolTypes.Comment;
        if (entity === 'abstract') return ETsEntitySymbolTypes.Abstract;
        if (entity.startsWith('@')) return ETsEntitySymbolTypes.Decorator;
        if (entity.startsWith('(')) return ETsEntitySymbolTypes.ArgumentStart;
        if (entity.startsWith(')')) return ETsEntitySymbolTypes.ArgumentEnd;
        if (entity.startsWith('[')) return ETsEntitySymbolTypes.OpenSquareBracket;
        if (entity.startsWith(']')) return ETsEntitySymbolTypes.CloseSquareBracket;
        if (entity.startsWith('{')) return ETsEntitySymbolTypes.OpenBrace;
        if (entity.startsWith('}')) return ETsEntitySymbolTypes.CloseBrace;
    }

    protected readEntityFromCode(): { entity: string, entityType: ETsEntitySymbolTypes | undefined } {
        while(/\s/.test(this.current.charAt(0))) {
            this.index++;
        }
        let entity;
        let entityType;
        const charat = this.current.charAt(0);

        if (SPECIAL_CHARS.includes(charat)) {
            let i = 1;
            entity = charat;
            // character could be double or even triple
            let longOperator = entity;
            while(SPECIAL_CHARS.includes(this.current.charAt(i))) {
                longOperator += this.current.charAt(i);
                i++;
            }
            if (LONG_OPERATORS.find(operator => longOperator.startsWith(operator))) {
                entity = longOperator;
            }
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

    public seekOf(chars: RegExp, exclude: boolean): { value: string, position: number } | undefined;
    public seekOf(chars: string, exclude: boolean): { value: string, position: number}  | undefined;
    public seekOf(charsOrReg: RegExp | string, exclude: boolean = false): { value: string, position: number } | undefined {
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
            return { position: index + exlength, value: result };
        }
    }

    public nextIs(sym: string, moveForward: boolean = false) {
        const isNext = this.current.trim().startsWith(sym);
        if (moveForward && isNext) {
            const pos = this.current.indexOf(sym);
            this.index += pos + 1;
        }
        return isNext;
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

    public readString(): string {
        if (this.current[0] === '"') this.index ++;
        const code = this.expectOf('"', true);
        this.index ++;
        return this.getStringByCode(code);
    }

    public readCleanString(): string {
        if (this.current[0] === '"') this.index ++;
        const code = this.expectOf('"', true);
        this.index ++;
        return this.getStringByCode(code, true);
    }

    public move(index: number): void {
        this.index += index;
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

    protected getStringByCode(code: string, clean = false):string {
        const codeRegez = /^__(\d+):(\d+)__$/;
        const read = code.match(codeRegez);
        if (!read) return;
        const quoteCode: EQuoteCode = Number(read[1]) as EQuoteCode;
        const quoteIndex = Number(read[2]);
        return this.getStringCodeEntity(quoteCode, quoteIndex, clean);
    }

    protected getStringCodeEntity(code: EQuoteCode, index: number, clean = false): string {
        let result = this.strings[code][index];
        if (clean) {
            result = result.substring(1, result.length - 1);
        }
        return result;
    }

    protected isNumber(entity: string): boolean {
        const trimmed = entity.trim();
        return /^\d+$/.test(trimmed);
    }

    protected isEntityName(entity: string, excludeKeywords: boolean = false): boolean {
        const trimmed = entity.trim();
        if (!excludeKeywords && LANGUAGE_KEYWORDS.includes(trimmed)) return false;
        return /^\w+$/.test(trimmed) && /^[^\d]/.test(trimmed);
    }

    public extractModifiers(): TPropertyModifiers {
        const { modifiers } = this;
        this.modifiers = {};
        return modifiers;
    }

    protected extractParameters(): any {
        const { modifiers, decorators } = this;
        this.modifiers = {};
        this.decorators = [];
        return { modifiers, decorators };
    }

    public lock(lockSybmol?: Symbol) {
        if (lockSybmol && this.lockers.find(l => l.symbol === lockSybmol)) return;
        const item = {
            symbol: lockSybmol ?? Symbol(),
            index: this.index,
        };
        this.lockers.push(item);
    }

    public unlock(lockSybmol?: Symbol) {
        if (this.lockers.length) {
            if (!lockSybmol || !this.lockers.find(l => l.symbol === lockSybmol)) {
                const item = this.lockers.pop();
                this.index = item?.index ?? 0;
            } else {
                const index = this.lockers.findIndex(l => l.symbol === lockSybmol);
                const item = this.lockers[index];
                this.lockers.splice(index, this.lockers.length - index);
                if (item) {
                    this.index = item.index;
                }
            }
        }
    }

    public apply(lockSybmol?: Symbol) {
        if (this.lockers.length) {
            if (!lockSybmol || !this.lockers.find(l => l.symbol === lockSybmol)) {
                this.lockers.pop();
            } else {
                const index = this.lockers.findIndex(l => l.symbol === lockSybmol);
                this.lockers.splice(index, this.lockers.length - index);
            }
        }
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

    private prepareCode() {
        // first, remove all comments;
        const comments = this.removeComments();

        // replace all string to the coded strings;
        ['"', "'", '`'].forEach(quote => this.replaceStringWith(quote));

        // then restore all comments;
        this.restoreComments(comments);
    }

    [util.inspect.custom]() {
        return {
            type: this.constructor.name,
            index: this.index,
            current: this.current
        }
    }
}
