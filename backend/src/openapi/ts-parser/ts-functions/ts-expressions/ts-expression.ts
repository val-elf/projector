import { ETsExpressionTypes, ITsExpression, TsEntity } from '../../model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { ITsType } from '../../ts-types';
import util from 'util';
import { TsTypeService } from '~/openapi/services/ts-type.service';

export abstract class TsExpression<T> extends TsEntity implements ITsExpression<T> {
    public readonly entityType = ETsEntityTypes.Expression;
    public expressionResultType: ITsType;
    expressionValue: T;

    public get isEmpty() {
        return !this.expressionValue && this.expressionType === undefined;
    }

    constructor(public readonly expressionType: ETsExpressionTypes) {
        super('');
    }

    protected getTsTypeByType() {
        switch(this.expressionType) {
            case ETsExpressionTypes.String:
                return TsTypeService.String;
            case ETsExpressionTypes.Number:
                return TsTypeService.Number;
        }
    }

    [util.inspect.custom](depth: number, options: any) {
        const result = super[util.inspect.custom](depth, options);
        return {
            ...result,
            type: this.expressionResultType,
            expressionType: this.expressionType,
            expressionValue: this.expressionValue,
        }
    }
}
