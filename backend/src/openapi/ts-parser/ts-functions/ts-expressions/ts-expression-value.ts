import { ETsExpressionTypes } from "../../model";
import { TsExpression } from "./ts-expression";

export class TsExpressionValue extends TsExpression<string | number | boolean> {
    constructor(public readonly value: string | number | boolean) {
        const type = typeof value === 'string' ? ETsExpressionTypes.String :
                    typeof value === 'number' ? ETsExpressionTypes.Number :
                    ETsExpressionTypes.Boolean
        ;
        super(type);
        this.expressionValue = value;
    }
}