import { ITsEntity } from '~/openapi/ts-parser/model';
import { ITsType } from '../../model';
import { ETsEntityTypes } from '~/openapi/ts-parser/ts-readers/model';

export class TsExtendsList extends Array<ITsType> implements ITsEntity {
    name = 'extends-list';
    entityType: ETsEntityTypes = ETsEntityTypes.TypeList;
}