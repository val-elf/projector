import { ITsExpression, TsEntity } from '../model';
import { ETsEntityTypes } from '../ts-readers/model';


export abstract class TsCodeBlock extends TsEntity {
    protected body: string;
    public readonly entityType: ETsEntityTypes.Unnamed;

    constructor(
        body: string,
    ) {
        super('');
        this.body = body;
    }

    public static createExpressionCodeBlock(expression: ITsExpression<unknown>): TsCodeBlock {
        return new TsExpressionCodeBlock(expression);
    }
}

class TsExpressionCodeBlock extends TsCodeBlock {
    constructor(public expression: ITsExpression<unknown>) {
        super('');
    }
}