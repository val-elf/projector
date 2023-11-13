import { ETsExpressionTypes, ITsExpression } from "../../model";
import { TsExpression } from "./ts-expression";

interface TsExpressionObjectField {
    name: string;
    value: ITsExpression<unknown>;
}

type TTsExpressionObjectValue = TsExpressionObjectField[];

export class TsExpressionObject extends TsExpression<TTsExpressionObjectValue> {

    constructor() {
        super(ETsExpressionTypes.Object);
        this.expressionValue = [];
    }

    public addField(name: string, field: ITsExpression<unknown>) {
        this.expressionValue.push({ name, value: field });
    }
}

