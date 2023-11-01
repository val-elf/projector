import { ETsExpressionTypes } from "../../model";
import { TsExpression } from "./ts-expression";
import util from 'util';

export class TsExpressionArray extends TsExpression<TsExpression<unknown>[]> {
    constructor(items: TsExpression<unknown>[]) {
        super(ETsExpressionTypes.Array);
        this.expressionValue = items;
    }

    [util.inspect.custom](depth: number, options: any) {
        const parent = super[util.inspect.custom](depth, options);
        return {
            ...parent,
            itemsCount: this.expressionValue.length,
        }
    }
}

