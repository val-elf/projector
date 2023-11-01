import { TsEntity } from './model';
import { ETsEntityTypes, ITsParser } from './ts-readers/model';

export class TsImport extends TsEntity {
    public readonly entityType = ETsEntityTypes.Import;
    public readonly definition: string;

    constructor(
        reader: ITsParser,
    ) {
        super('import');
        this.definition = reader.expectOf(';');
    }
}