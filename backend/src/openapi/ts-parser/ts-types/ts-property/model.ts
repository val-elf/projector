import { IOpenApiSerializable } from '~/openapi/components/model';
import { ITsType } from '..';
import { CommonOADefinition } from '~/openapi/components';

export interface ITsProperty extends IOpenApiSerializable{
    name: string;
    propertyType: ITsType;
    definition: CommonOADefinition;
    isOptional: boolean;
}
