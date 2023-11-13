import { ETsExpressionTypes, ITsExpression, ITsParametersList, TsEntity } from '../../model';
import { TsCodeBlock } from '../../ts-code-block/ts-code-block';
import { ETsEntityTypes } from '../../ts-readers/model';
import { ITsType } from '../../ts-types';

export abstract class TsFunction extends TsEntity implements ITsExpression<never> {
    get expressionResultType(): ITsType {
        return this.returnType;
    };
    expressionType?: ETsExpressionTypes = ETsExpressionTypes.Function;
    expressionValue: never;
    public entityType = ETsEntityTypes.Function;

    public parameters: ITsParametersList;
    public returnType: ITsType;
    public isAsync: boolean;
    public body: TsCodeBlock;
}