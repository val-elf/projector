import { ITsEntity } from '../model';

export enum ETsEntitySymbolTypes {
    Class = 'class',
    Interface = 'interface',
    Extends = 'extends',
    Implements = 'implements',
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
    ArgumentStart = 'argument-start',
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
    GenericOpen = 'generic-open',
    GenericClose = 'generic-close',
    Comma = 'comma',
    Union = 'union',
    Intersection = 'intersection',
    EntityName = 'entity-name',
    Optional = 'optional',
}

export enum ETsEntityTypes {
    Argument = 'argument',
    Class = 'class',
    Interface = 'interface',
    Enum = 'enum',
    Type = 'type',
    TypeList = 'type-list',
    Method = 'method',
    Field = 'field',
    Property = 'property',
    Decorator = 'decorator',
    Export = 'export',
    Import = 'import',
    Comment = 'comment',
    Variable = 'variable',
    Assignment = 'assignment',
    TypeDefinition = 'type-definition',
    Generic = 'generic',
    EntityName = 'entity-name',
    Function = 'function',
    ArrowFunction = 'arrow-function',
    Unnamed = 'unnamed', // empty code block
    Unknown = 'unknown',
    Expression = 'expression',
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

export type TReadEntityResult = ITsEntity | ITsEntity[] | ETsEntityTypes | undefined;

export interface ITsParser {
    readonly code: string;
    readonly lastEntity: { entity: string, entityType: ETsEntitySymbolTypes };
    readEntity(needNextType?: ETsEntitySymbolTypes): TReadEntityResult;
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

