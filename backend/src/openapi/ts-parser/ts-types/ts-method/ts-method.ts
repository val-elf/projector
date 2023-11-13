import { IOARoute } from "~/openapi/components/model";
import { ITsParametersList, TsEntity } from "../../model";
import { ITsMethod, ITsType } from "../model";
import { ETsEntityTypes } from "../../ts-readers/model";
import { TsCodeBlock } from "../../ts-code-block/ts-code-block";

export abstract class TsMethod extends TsEntity implements ITsMethod {
    public readonly entityType = ETsEntityTypes.Method;
    public returnType: ITsType;
    public isAbstract: boolean;
    public isStatic?: boolean;
    public parameters: ITsParametersList;
    public body?: TsCodeBlock;
    public definition?: IOARoute;
    public name: string;

    public setDefinition(definition: IOARoute): void {
        this.definition = definition;
        this.definition
    }

    public abstract toOpenApi(): { [key: string]: string | number | null | boolean | object };

    constructor(
        name: string,
        public readonly methodOwner: any,
    ) {
        super(name);
    }
}