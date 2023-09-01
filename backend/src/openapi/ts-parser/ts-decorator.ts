import { ITsDecorator, ITsParameters, TsEntity } from './model';
import { TsParameter } from './ts-parameter';
import { ETsEntityTypes, ITsParser } from './ts-readers/model';
import util from 'util';

export function createDecorator(reader: ITsParser): ITsDecorator {
    return new TsDecorator(reader);
}

export class TsDecorator extends TsEntity implements ITsDecorator {

    public readonly parameters: ITsParameters[];
    public readonly type = ETsEntityTypes.Decorator;

    public static createDecorator(reader: ITsParser) {
        return new TsDecorator(reader);
    }

    constructor(reader: ITsParser) {
        const name = reader.expectOf('(', true);
        super(name, ETsEntityTypes.Decorator);
        if (name) {
            let params = reader.readToBalanced(')');
            this.name = name.substring(1);
            if (params) {
                params = params.substring(1, params.length - 1);
                this.parameters = this.readParameters(params, reader);
            }
        }
    }

    private readParameters(params: string, reader: ITsParser): ITsParameters[] {
        return TsParameter.readParameters(params, reader);
    }

    [util.inspect.custom]() {
        return {
            name: this.name,
            type: this.type,
            parameters: this.parameters.map(p => p.name),
        }
    }
}