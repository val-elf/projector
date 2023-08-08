import { ETsEntityTypes, ITsReader, TsEntity } from './ts-readers/model';

export class TsCodeBlock extends TsEntity {
    private readonly body: string;

    constructor(
        private reader: ITsReader,
    ) {
        super('', ETsEntityTypes.CodeBlock);
        this.body = reader.readToBalanced('}', true);
    }
}