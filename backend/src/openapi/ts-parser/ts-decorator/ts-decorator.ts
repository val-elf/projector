import { ITsArgumentsList, ITsDecorator, TsEntity } from '../model';
import { ETsEntityTypes } from '../ts-readers/model';
import util from 'util';

export abstract class TsDecorator extends TsEntity implements ITsDecorator {

    public readonly argumentsList: ITsArgumentsList;
    public readonly entityType = ETsEntityTypes.Decorator;

    constructor(public readonly name: string, argumentsList: ITsArgumentsList) {
        super(name);
        this.argumentsList = argumentsList;
    }

    [util.inspect.custom]() {
        return {
            name: this.name,
            type: this.entityType,
            arguments: this.argumentsList?.arguments.map(p => p.name) ?? [],
        }
    }
}