import { ITsExpression, TsEntity } from '../model';
import { ETsEntitySymbolTypes, ETsEntityTypes } from '../ts-readers/model';
import { ITsType } from '../ts-types';

export abstract class TsVariable extends TsEntity {
    public readonly entityType = ETsEntityTypes.Variable;

    public abstract get variableType(): ITsType;
    public abstract get value(): ITsExpression<unknown>;
    public abstract get variableSort(): ETsEntitySymbolTypes.Const | ETsEntitySymbolTypes.Let | ETsEntitySymbolTypes.Var;
    public abstract get isExport(): boolean;

    constructor(
    ) {
        super('');
    }
}