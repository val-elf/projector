import { EExpressionOperatorTypes, ETsExpressionTypes, ITsExpression } from "../../model";
import { TsExpression } from "./ts-expression";
import { TsExpressionOperation } from "./ts-expression-operation";

export type TTsExpressionComplexValues = ITsExpression<unknown>[];

export class TsExpressionComplex extends TsExpression<TTsExpressionComplexValues> {
    public operators: TsExpressionOperation[] = [];

    constructor() {
        super(ETsExpressionTypes.Complex);
        this.expressionValue = [];
    }

    public get latestExpression(): ITsExpression<unknown> {
        return this.expressionValue[this.expressionValue.length - 1];
    }

    public setExpressionParameters(expression: ITsExpression<unknown>) {
        this.expressionValue.push(expression);
    }

    public setNextOperation(operation: EExpressionOperatorTypes) {
        this.operators.push(new TsExpressionOperation(operation));
    }

}