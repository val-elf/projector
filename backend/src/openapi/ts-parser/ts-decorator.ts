import { TsParameter } from './ts-parameters';
import { ETsEntityTypes, ITsReader, TsEntity } from './ts-readers/model';
import util from 'util';

export class TsDecorator extends TsEntity {

    public readonly parameters: TsParameter[];
    public readonly type = ETsEntityTypes.Decorator;

    constructor(reader: ITsReader) {
        const name = reader.expectOf('(', true);
        super(name, ETsEntityTypes.Decorator);
        if (name) {
            let params = reader.readToBalanced(')');
            this.name = name.substring(1);
            if (params) {
                params = params.substring(1, params.length - 1);
                this.parameters = TsParameter.readParameters(params, reader);
            }
        }
    }

    [util.inspect.custom]() {
        return {
            name: this.name,
            type: this.type,
            parameters: this.parameters.map(p => p.name),
        }
    }
}