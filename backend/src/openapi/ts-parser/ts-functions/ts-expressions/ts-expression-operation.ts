import { EExpressionOperatorTypes, ITsExpressionOperation, TsEntity } from "../../model";
import { ETsEntityTypes } from "../../ts-readers/model";
import util from 'util';

export class TsExpressionOperation extends TsEntity implements ITsExpressionOperation {
    public operatorType: EExpressionOperatorTypes;
    public readonly entityType = ETsEntityTypes.ExpressionOperation;
    constructor(operator: EExpressionOperatorTypes) {
        super('')
        this.operatorType = operator;
    }

    public static OPERATIONS = {
        '+': EExpressionOperatorTypes.Sum,
        '-': EExpressionOperatorTypes.Sub,
        '*': EExpressionOperatorTypes.Multiply,
        '/': EExpressionOperatorTypes.Divide,
        '%': EExpressionOperatorTypes.Modulo,
        '^': EExpressionOperatorTypes.Xor,
        '&': EExpressionOperatorTypes.BitwiseAnd,
        '|': EExpressionOperatorTypes.BitwiseOr,
        '&&': EExpressionOperatorTypes.And,
        '||': EExpressionOperatorTypes.Or,
        '!': EExpressionOperatorTypes.Not,
    };

    [util.inspect.custom]() {
        return { operatorType: this.operatorType }
    }
}
