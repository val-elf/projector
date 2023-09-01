import { CommonOADefinition } from '../../../components';
import { IOpenApiGather, IOpenApiSerializable } from '../../../components/model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { ITsProperty } from './model';
import { ITsType } from '..';
import { TsEntity } from '../../model';


export class TsProperty extends TsEntity implements IOpenApiSerializable, ITsProperty {
    public propertyType: ITsType;
    public isOptional: boolean;
    public definition: CommonOADefinition;

    constructor(
        name: string,
    ) {
        super(name, ETsEntityTypes.Property);
    }

    public toOpenApi(gatherer: IOpenApiGather) {
        return {
            [this.name]: this.propertyType.toOpenApi(gatherer),
        }
    }
}

