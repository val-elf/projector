import { TsEntity } from './model';
import { ETsEntityTypes, ITsParser } from './ts-readers/model';

export class TsVariable extends TsEntity {
    constructor(
        reader: ITsParser,
        private isExported: boolean,
        private variableType: "const" | "let" | "var"
    ) {
        super('', ETsEntityTypes.Variable);
        const constDefinition = reader.expectOf(';');
        this.read(reader, constDefinition);
    }

    private read(reader: ITsParser, definition: string) {
        // console.log('Reader variable:', definition);
    }
}