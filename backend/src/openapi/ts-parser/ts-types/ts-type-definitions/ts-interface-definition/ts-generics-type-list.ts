import { ETsEntityTypes } from '~/openapi/ts-parser/ts-readers/model';
import { TsType } from '../..';
import { TsEntity } from '~/openapi/ts-parser/model';

export class TsGenericsTypeList extends TsEntity {
    type = ETsEntityTypes.TypeList;

    constructor(
        public readonly genericsList: TsType[],
    ) {
        super('', ETsEntityTypes.TypeList);
    }
}