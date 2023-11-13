import { ETsEntityTypes } from "~/openapi/ts-parser/ts-readers/model";
import { ITsType } from "../../model";
import { TsParametersList } from "~/openapi/ts-parser/ts-functions/ts-parameter/ts-parameters-list";
import util from 'util';
import { IOAContainer, IOARoute } from "~/openapi/components/model";
import { TsMethod } from "../../ts-method";
import { TsCodeBlock } from "~/openapi/ts-parser/ts-code-block/ts-code-block";
import { TsTypeOwner } from "~/openapi/ts-parser/model";

export abstract class TsInterfaceMethod extends TsMethod implements IOAContainer<IOARoute> {
    public name: string;
    public readonly isStatic: boolean = false;
    public readonly isAbstract: boolean = true;
    public parameters: TsParametersList;
    public returnType: ITsType | undefined;
    public readonly body?: TsCodeBlock = undefined;

    public readonly entityType = ETsEntityTypes.Method;

    // interface method is abstract by default and cannot implement the route
    public definition?: IOARoute;
    public setDefinition(_definition: IOARoute): void { }

    constructor(
        name: string,
        protected owner: TsTypeOwner
    ) {
        super(name, owner);
    }

    toOpenApi(): { [key: string]: string | number | object; } {
        return {};
    }

    [util.inspect.custom](depth: number, options: any): any {
        return {
            name: this.name,
            isStatic: this.isStatic,
            isAbstract: this.isAbstract,
            parameters: this.parameters,
            returnType: this.returnType,
            body: this.body,
        }
    }
}