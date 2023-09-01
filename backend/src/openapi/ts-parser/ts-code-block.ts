import { TsEntity } from './model';
import { ETsEntityTypes, ITsParser } from './ts-readers/model';

export class TsCodeBlock extends TsEntity {
    private readonly body: string;

    constructor(
        private reader: ITsParser,
    ) {
        super('', ETsEntityTypes.Unnamed);
        this.body = reader.readToBalanced('}', true);
    }
}