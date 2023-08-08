import { ETsEntityTypes, ITsReader, TsEntity } from './ts-readers/model';
import { TsArrowFunctionParser } from './ts-readers/ts-arrow-function-parser';

export class TsArrowFunction extends TsEntity {
    private body: TsEntity;

    constructor(reader: ITsReader, definition: string, args: { entity: string, entityType: ETsEntityTypes }[]) {
        super('', ETsEntityTypes.ArrowFunction);
        reader.move(2); // move to arrow definition length forward

        const afReader = new TsArrowFunctionParser(reader);
        const entity = afReader.readEntity();
        if (entity && entity instanceof TsEntity) {
            this.body = entity;
        }
    }
}