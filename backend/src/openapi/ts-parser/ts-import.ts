import { ETsEntityTypes, ITsReader, TsEntity } from './ts-readers/model';

export class TsImport extends TsEntity {
    constructor(
        reader: ITsReader,
    ) {
        super('import', ETsEntityTypes.Import);
        const definition = reader.expectOf(';');
    }
}