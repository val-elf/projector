import { ETsEntityTypes } from '../../../ts-readers/model';
import { TsFunction } from '../ts-function';
import { ITsType } from '~/openapi/ts-parser/ts-types';
import { ITsParametersList } from '~/openapi/ts-parser/model';

export class TsArrowFunction extends TsFunction {

    constructor(
        public name: string,
        public parameters: ITsParametersList,
        public returnType: ITsType,
    ) {
        super('');
        this.entityType = ETsEntityTypes.ArrowFunction;
    }
}