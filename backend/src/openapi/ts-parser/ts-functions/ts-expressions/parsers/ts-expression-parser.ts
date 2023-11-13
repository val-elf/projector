import { EExpressionOperatorTypes, ETsExpressionTypes, ITsEntity, ITsExpression } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes } from "~/openapi/ts-parser/ts-readers/model";
import { TsExpression } from "../ts-expression";
import { TsArgumentsListParser } from "../../ts-argument/parsers/ts-arguments-list-parser";
import { TsExpressionObjectParser } from "./ts-expression-object-parser";
import { TsExpressionArrayParser } from "./ts-expression-array-parser";
import { TsExpressionComplex } from "../ts-expression-complex";
import { TsExpressionOperation } from "../ts-expression-operation";
import { TsExpressionFunction } from "../ts-expression-function";
import { TsExpressionValue } from "../ts-expression-value";
import { TsExpressionObjectAccess } from "../ts-expression-object-access";
import { TsFunctionParser } from "../../ts-function/ts-function-parser";

class TsExpressionOperationContainer {
    public expression: ITsExpression<unknown>;
    private _latestEntityName?: string = undefined;
    private _isConstructor: boolean = false;

    public set latestEntityName(value: string) {
        this._latestEntityName = value;
    }

    public get latestEntityName(): string {
        const result = this._latestEntityName;
        this._latestEntityName = undefined;
        return result;
    }

    public get hasLatestEntityName(): boolean {
        return this._latestEntityName !== undefined;
    }

    public get hasWorker(): boolean {
        return this.workedExpression !== undefined;
    }

    public workedExpression?: TsExpression<unknown>;

    public applyValue(value: ITsExpression<unknown>): void {
        this.workedExpression = undefined;

        if (this.expression === value) return;

        if (value instanceof TsExpressionFunction && this._isConstructor) {
            value.markAsConstructor();
            this._isConstructor = false;
        }

        if (!this.expression) {
            this.expression = value;
            return;
        }

        if (this.expression instanceof TsExpressionComplex) {
            if (this.expression.latestExpression !== value) {
                this.expression.setExpressionParameters(value);
            }
            return;
        }

        const complex = new TsExpressionComplex();
        complex.setExpressionParameters(this.expression);
        complex.setExpressionParameters(value);
        this.expression = complex;
    }

    public markAsConstructor(): void {
        this._isConstructor = true;
    }

    public applyWorker(value: TsExpression<unknown>): void {
        this.applyValue(value);
        this.workedExpression = value;
    }

    public getWorker(): TsExpression<unknown> {
        const result = this.workedExpression;
        this.workedExpression = undefined;
        return result;
    }

    public setOperation(operation: EExpressionOperatorTypes): void {
        if (!this.expression) {
            this.expression = new TsExpressionComplex();
        } else if (this.expression.expressionType !== ETsExpressionTypes.Complex) {
            const complex = new TsExpressionComplex();
            complex.setExpressionParameters(this.expression);
            this.expression = complex;
        }
        (this.expression as TsExpressionComplex).setNextOperation(operation);
    }
}

export class TsExpressionParser extends TsParserBase {

    public static readExpression(parent: TsParserBase): ITsExpression<unknown> {
        try {
            console.group('Reading Expression Start');
            const parser = new TsExpressionParser(parent);
            return parser.readExpression();
        } finally {
            console.groupEnd();
        }
    }

    private readExpression(): ITsExpression<unknown> {
        const container = new TsExpressionOperationContainer();
        while (true) {
            if (this.readEntity(container) === null) break;
        }
        return container.expression;
    }

    private argumentWasStarted: boolean = false;

    protected analyseEntity(
        entity: string,
        entityType: ETsEntitySymbolTypes,
        container: TsExpressionOperationContainer
    ): ITsEntity {
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                container.latestEntityName = entity;
                if (container.hasWorker) {
                    const worker = container.getWorker();
                    if (worker instanceof TsExpressionObjectAccess) {
                        worker.setPropertyName(entity);
                    }
                    container.applyWorker(worker);
                }
                break;
            case ETsEntitySymbolTypes.String: {
                this.index++;
                const stringCode = this.expectOf(entity, true);
                this.index ++;
                const stringValue = this.getStringByCode(stringCode);
                const value = new TsExpressionValue(stringValue);
                container.applyValue(value);
                break;
            }
            case ETsEntitySymbolTypes.Number:
                this.index += entity.length;
                container.applyValue(new TsExpressionValue(+entity));
                break;
            case ETsEntitySymbolTypes.MathOperation:
                this.index += entity.length;
                container.setOperation(TsExpressionOperation.OPERATIONS[entity]);
                break;
            case ETsEntitySymbolTypes.OpenSquareBracket:
                this.index += entity.length;
                const arrayExpression = TsExpressionArrayParser.readArrayExpression(this);
                container.applyValue(arrayExpression);
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
                this.index += entity.length;
                this.argumentWasStarted = true;

                if (container.hasWorker) {
                    const worker = container.getWorker();
                    const argumentsList = TsArgumentsListParser.readArgumentsList(this)
                    if (worker instanceof TsExpressionObjectAccess) {
                        worker.setArguments(argumentsList);
                        container.applyValue(worker);
                        break;
                    }
                }

                if (container.hasLatestEntityName) {
                    // reading function arguments
                    const argumentsList = TsArgumentsListParser.readArgumentsList(this)
                    const functionExpression = new TsExpressionFunction(container.latestEntityName, argumentsList);
                    container.applyValue(functionExpression);
                } else {
                    const nestedExpression = TsExpressionParser.readExpression(this);
                    container.applyValue(nestedExpression);
                }
            case ETsEntitySymbolTypes.ArgumentEnd:
                if (this.argumentWasStarted) {
                    this.index += entity.length;
                    this.argumentWasStarted = false;
                    break;
                }
                return null;
            case ETsEntitySymbolTypes.New:
                this.index += entity.length;
                container.markAsConstructor();
                break;
            case ETsEntitySymbolTypes.Dot: {
                this.index += entity.length;
                // this is case with calling mehtod of object of access to the property of object
                const value = new TsExpressionObjectAccess(container.latestEntityName);
                container.applyWorker(value);
                break;
            }
            case ETsEntitySymbolTypes.OpenBrace:
                this.index += entity.length;
                const typeElement = TsExpressionObjectParser.readExpressionObject(this);
                container.applyValue(typeElement);
                break;
            case ETsEntitySymbolTypes.Async:
                // probably this is async function or arrow function
                const functionExpression = TsFunctionParser.readFunction(this);
                container.applyValue(functionExpression);
            default:
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;
        if (entity === 'new') return ETsEntitySymbolTypes.New;
        if (entity === '"') return ETsEntitySymbolTypes.String;
        if (entity === '(') return ETsEntitySymbolTypes.ArgumentStart;
        if (entity === ')') return ETsEntitySymbolTypes.ArgumentEnd;
        if (entity === '.') return ETsEntitySymbolTypes.Dot;
        if (['+', '++', '-', '--', '/', '*', '==', '===', '%', '&', '&&', '||', '|', '^', '!', '?', ':', '??'].includes(entity))
            return ETsEntitySymbolTypes.MathOperation;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
        if (this.isNumber(entity)) return ETsEntitySymbolTypes.Number;
    }
}