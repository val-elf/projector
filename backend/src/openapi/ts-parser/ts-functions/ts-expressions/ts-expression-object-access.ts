import { TsTypeService } from "~/openapi/services/ts-type.service";
import { ETsExpressionTypes } from "../../model";
import { TsArgumentsList } from "../ts-argument";
import { TsExpression } from "./ts-expression";
import { TsBaseTypeDefinition } from "../../ts-types/ts-type-definitions/ts-base-type-definition";

export class TsExpressionObjectAccess extends TsExpression<string> {
    public argumentsList?: TsArgumentsList;

    public get isMethod() {
        return this.argumentsList?.count > 0;
    }

    constructor(objectName: string, public propertyName?: string) {
        super(ETsExpressionTypes.ObjectAccess);
        this.expressionValue = objectName;
    }

    public setPropertyName(propertyName: string) {
        this.propertyName = propertyName;
    }

    public setArguments(args: TsArgumentsList) {
        this.argumentsList = args;
    }

    public get paramType(): TsBaseTypeDefinition {
        return TsTypeService.getService().findTsType(this.expressionValue);
    }
}