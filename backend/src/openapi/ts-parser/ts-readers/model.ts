import util from "util";

export enum ETsEntityTypes {
    Class = 'class',
    CodeBlock = 'code-block',
    Interface = 'interface',
    Expression = 'expression',
    Enum = 'enum',
    Type = 'type',
    Method = 'method',
    Field = 'field',
    Property = 'property',
    Decorator = 'decorator',
    Export = 'export',
    Import = 'import',
    Comment = 'comment',
    Public = 'public',
    Private = 'private',
    Protected = 'protected',
    Static = 'static',
    Readonly = 'readonly',
    Async = 'async',
    Await = 'await',
    Function = 'function',
    ArrowFunction = 'arrow-function',
    TypeDefinition = 'type-definition',
    Abstract = 'abstract',
    Argument = 'argument',
    Variable = 'variable',
    Assignment = 'assignment',
    Get = 'get',
    Set = 'set',
    OpenBrace = 'open-brace',
    CloseBrace = 'close-brace',
    OpenSquareBracket = 'open-square-bracket',
    CloseSquareBracket = 'close-square-bracket',
    OpenParenthesis = 'open-parenthesis',
    CloseParenthesis = 'close-parenthesis',
    EntityName = 'entity-name',
    Optional = 'optional',
}

export class TsEntity {
    constructor(
        public name: string,
        public entityType: ETsEntityTypes,
    ) {}

    [util.inspect.custom](depth: number, options: any): any {
        return {
            name: this.name,
            entityType: this.entityType,
        }
    }
}

export type TAttributes = {
    accessModifier?: ETsEntityTypes;
    isExport?: boolean;
    isImport?: boolean;
    isAsync?: boolean;
    isStatic?: boolean;
    isAbstract?: boolean;
    isGetter?: boolean;
    isSetter?: boolean;
    isReadonly?: boolean;
    isOptional?: boolean;
}

export interface ITsReader {
    readonly code: string;
    readonly lastEntity: { entity: string, entityType: ETsEntityTypes };
    readEntity(needNextType?: ETsEntityTypes): TsEntity | ETsEntityTypes | undefined;
    expectOf(regex: RegExp, exclude?: boolean): string | undefined;
    expectOf(chars: string, exclude?: boolean): string | undefined;
    readToBalanced(chars: string, inside?: boolean): string | undefined;
    readToEnd(): string;
    move(index: number);
    readString(count: number): string;
    restoreCode(source?: string): string;
    lock(): void;
    unlock(): void;
    apply(): void;
}

