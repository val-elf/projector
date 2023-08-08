import { ETsEntityTypes, ITsReader, TsEntity } from './ts-readers/model';

export class TsExpression extends TsEntity {
    constructor(
        private expression: string,
    ) {
        super('', ETsEntityTypes.Expression);
    }
}