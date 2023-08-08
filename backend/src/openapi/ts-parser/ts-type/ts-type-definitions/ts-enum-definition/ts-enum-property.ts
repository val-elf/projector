import { ETsEntityTypes, TsEntity } from '~/openapi/ts-parser/ts-readers/model';
import { ITsProperty } from '../../ts-property';
import { IOpenApiGather } from '~/openapi/components/model';
import { TsType } from '../../ts-type';
import { CommonOADefinition } from '~/openapi/components';

export class TsEnumProperty extends TsEntity implements ITsProperty {

    public propertyType = TsType.String;
    public isOptional = false;
    public definition: CommonOADefinition;

    constructor(
        public name: string,
        public value: string,
    ) {
        super(name, ETsEntityTypes.Property);
    }

    toOpenApi(gatherer: IOpenApiGather): { [key: string]: string | number | object; } {
        return {
            [this.name]: this.value,
        };
    }
}