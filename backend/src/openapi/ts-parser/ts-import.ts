import { TsEntity } from './model';
import { ETsEntityTypes, ITsParser } from './ts-readers/model';

export class TsImport extends TsEntity {
    constructor(
        reader: ITsParser,
    ) {
        super('import', ETsEntityTypes.Import);
        const definition = reader.expectOf(';');
    }
}