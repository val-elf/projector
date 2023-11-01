import { ITsParameter, TsEntity } from '../../model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { ITsType } from '../../ts-types';

export class TsParameter extends TsEntity implements ITsParameter {
    public readonly entityType = ETsEntityTypes.Parameter;

    constructor(
        name: string,
        public readonly parameterType: ITsType,
        public readonly isOptional: boolean,
        public readonly threeDots: boolean
    ) {
        super(name);
    }
}
