import { TsEntity } from "../../model";
import { ETsEntityTypes } from "../../ts-readers/model";
import { TsExpression } from "../ts-expressions";

export class TsArgumentsList extends TsEntity {
    public readonly entityType = ETsEntityTypes.ArgumentsList;
    private _arguments: TsExpression<unknown>[] = [];

    constructor() {
        super('');
    }

    public get count(): number {
        return this._arguments.length;
    }

    public get arguments(): TsExpression<unknown>[] {
        return this._arguments;
    }

    addArgument(argument: TsExpression<unknown>) {
        this._arguments.push(argument);
    }
}