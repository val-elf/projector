import { ETsEntityTypes, ITsReader, TsEntity } from './ts-readers/model';

export class TsVariable extends TsEntity {
    constructor(
        reader: ITsReader,
        private isExported: boolean,
        private variableType: "const" | "let" | "var"
    ) {
        super('', ETsEntityTypes.Variable);
        const constDefinition = reader.expectOf(';');
        this.read(reader, constDefinition);
    }

    private read(reader: ITsReader, definition: string) {
        // console.log('Reader variable:', definition);
    }
}