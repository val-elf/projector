import { OATag } from '../components';
import { ETsEntityTypes } from './ts-readers/model';
import util from 'util';
import { ITsType } from './ts-types';
import { TsInterfaceDefinition, TsTypeDefinition } from './ts-types/ts-type-definitions';
import { TsClass } from './ts-types/ts-type-definitions/ts-class-definition';

export interface ITsTagged {
    tag?: OATag;
}

export interface ITsEntity {
    name: string;
    entityType: ETsEntityTypes;
}

export interface ITsParameter extends ITsEntity {
    parameterType: ITsType;
    isOptional?: boolean;
}

export enum ETsExpressionTypes {
    Boolean = 'boolean',
    String = 'string',
    InterpolatedString = 'interpolated-string',
    Number = 'number',
    FunctionCall = 'function-call',
    Function = 'function',
    Literal = 'literal',
    Complex = 'complex',
    Object = 'object', // when value is declared like { a: 1, b: 2 } notation
    ObjectAccess = 'object-access', // when value is declared like a.b or a.b() notation
    Array = 'array',
}

export enum EExpressionOperatorTypes {
    Sum = 'summa',
    Sub = 'subtraction',
    Multiply = 'multiply',
    Divide = 'divide',
    Modulo = 'modulo',
    Xor = 'xor',
    Or = 'or',
    And = 'and',
    BitwiseOr = 'bor',
    BitwiseAnd = 'band',
    Not = 'not',
}

export interface ITsExpressionOperation extends ITsEntity {
    operatorType :EExpressionOperatorTypes
}

export interface ITsExpression<T> extends ITsEntity {
    expressionResultType: ITsType;
    expressionType?: ETsExpressionTypes;
    expressionValue: T;
}

export interface ITsParametersList extends ITsEntity {
    parameters: ITsParameter[];
}

export interface ITsArgumentsList extends ITsEntity {
    arguments: ITsExpression<unknown>[];
    count: number;
}

export interface ITsDecorator extends ITsEntity {
    argumentsList: ITsArgumentsList;
}

export abstract class TsEntity implements ITsEntity {
    public abstract readonly entityType: ETsEntityTypes;

    constructor(
        public name: string,
    ) {}

    [util.inspect.custom](depth: number, options: any): any {
        return {
            name: this.name,
            entityType: this.entityType,
        }
    }
}

export class TsEntityNamed extends TsEntity {
    public readonly entityType = ETsEntityTypes.EntityName;
    constructor(name: string) {
        super(name);
    }
}

export type TsTypeOwner = TsInterfaceDefinition | TsTypeDefinition | TsClass;

