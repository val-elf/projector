import { ITsEntity } from '../model';

export enum ETsEntitySymbolTypes {
    Abstract = 'abstract',
    ArgumentDelimeter = 'argument-delimeter',
    ArgumentEnd = 'argument-end',
    ArgumentStart = 'argument-start',
    ArrowFunction = 'arrow-function',
    As = 'as',
    Assignment = 'assignment',
    Asterisk = 'asterisk',
    Async = 'async',
    Await = 'await',
    Class = 'class',
    Comma = 'comma',
    Comment = 'comment',
    Decorator = 'decorator',
    Dot = 'dot',
    EntityName = 'entity-name',
    Enum = 'enum',
    Extends = 'extends',
    Export = 'export',
    Field = 'field',
    From = 'from',
    Get = 'get',
    Implements = 'implements',
    Import = 'import',
    Interface = 'interface',
    Intersection = 'intersection',
    MathOperation = 'math-operation',
    Method = 'method',
    New = 'new',
    Number = 'number',
    Property = 'property',
    Function = 'function',
    Private = 'private',
    Optional = 'optional',
    Protected = 'protected',
    Public = 'public',
    Readonly = 'readonly',
    Rest = 'rest',
    Semicolon = 'semicolon',
    Set = 'set',
    Static = 'static',
    String = 'string',
    Type = 'type',
    TypeDefinition = 'type-definition',
    Variable = 'variable',
    Const = 'const',
    Var = 'var',
    Let = 'let',

    OpenBrace = 'open-brace',
    CloseBrace = 'close-brace',

    OpenSquareBracket = 'open-square-bracket',
    CloseSquareBracket = 'close-square-bracket',

    OpenParenthesis = 'open-parenthesis',
    CloseParenthesis = 'close-parenthesis',

    GenericOpen = 'generic-open',
    GenericClose = 'generic-close',

    Union = 'union',
}

export enum ETsEntityTypes {
    Argument = 'argument',
    ArrowFunction = 'arrow-function',
    Assignment = 'assignment',
    ArgumentsList = 'arguments-list', // arguments is a list of function call arguments
    Class = 'class',
    ClassBody = 'class-body',
    Comment = 'comment',
    Decorator = 'decorator',
    Enum = 'enum',
    Expression = 'expression',
    EntityName = 'entity-name',
    ExpressionOperation = 'expression-operation',
    Export = 'export',
    Field = 'field',
    Function = 'function',
    GenericsList = 'generics-list',
    GenericItem = 'generic-item',
    Import = 'import',
    Interface = 'interface',
    Method = 'method',
    New = 'new',
    OADefinition = 'oa-definition',
    ObjectField = 'object-field',
    Parameter = 'parameter',
    ParametersList = 'parameters-list', // parameters is a list of function definition parameters
    Property = 'property',
    TypeDefinition = 'type-definition',
    Type = 'type',
    TypeList = 'type-list',
    Unnamed = 'unnamed', // empty code block
    Unknown = 'unknown',
    Variable = 'variable',
}

export type TPropertyModifiers = {
    accessModifier?: ETsEntitySymbolTypes;
    isAsync?: boolean;
    isStatic?: boolean;
    isAbstract?: boolean;
    isGetter?: boolean;
    isSetter?: boolean;
    isReadonly?: boolean;
}

export type TReadEntityResult = null | undefined | ITsEntity;

export interface ITsParser {
    readonly code: string;
    readonly lastEntity: { entity: string, entityType: ETsEntitySymbolTypes };
    extractModifiers(): TPropertyModifiers;
    readEntity(needNextType?: ETsEntitySymbolTypes): TReadEntityResult;
    expectOf(regex: RegExp, exclude?: boolean): string | undefined;
    expectOf(chars: string, exclude?: boolean): string | undefined;
    readToBalanced(chars: string, inside?: boolean): string | undefined;
    readToEnd(): string;
    move(index: number);
    readString(): string;
    readCleanString(): string;
    restoreCode(source?: string): string;
    lock(): void;
    unlock(): void;
    apply(): void;
}

export const LANGUAGE_KEYWORDS = [
    'private', 'protected', 'private',
    'abstract',
    'readonly',
    'const', 'let', 'var',
    'new', 'extends', 'implements',
    'get', 'set',
    'class', 'interface', 'enum', 'type', 'namespace', 'module',
    'function', 'async', 'await', 'static',
    'import', 'export'
];
