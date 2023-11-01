import { ETsExpressionTypes } from "../../model";
import { TsArgumentsList } from "../ts-argument";
import { TsExpression } from "./ts-expression";

interface ITsExpressionFunctionValue {
    functionName: string;
    argumentsList: TsArgumentsList;
}

export class TsExpressionFunction extends TsExpression<ITsExpressionFunctionValue> {
    private _isConstructor = false;

    get isConstructor() {
        return this._isConstructor;
    }

    constructor(public readonly functionName, public readonly argumentsList: TsArgumentsList) {
        super(ETsExpressionTypes.FunctionCall);
        this.expressionValue = {
            functionName,
            argumentsList,
        };
    }

    public markAsConstructor() {
        this._isConstructor = true;
    }
}
