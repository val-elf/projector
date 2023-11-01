import { ITsParameter, ITsParametersList, TsEntity } from "../../model";
import { ETsEntityTypes } from "../../ts-readers/model";

export class TsParametersList extends TsEntity implements ITsParametersList {
    public readonly parameters: ITsParameter[] = [];
    public readonly entityType = ETsEntityTypes.ParametersList;

    constructor() {
        super('');
    }

    public addParameter(parameter: ITsParameter) {
        this.parameters.push(parameter);
    }

    public addParameters(parameters: ITsParameter[]) {
        this.parameters.push(...parameters);
    }
}