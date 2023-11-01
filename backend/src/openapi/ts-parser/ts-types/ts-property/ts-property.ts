import { IOAProperty, IOpenApiSerializable } from '../../../components/model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { ITsProperty, ITsType } from '..';
import { TsEntity } from '../../model';

import util from 'util';
import { OAProperty } from '~/openapi/components/oa-property';

export abstract class TsProperty extends TsEntity implements IOpenApiSerializable, ITsProperty {
    public readonly entityType = ETsEntityTypes.Property;
    public abstract propertyType: ITsType;
    public abstract isOptional: boolean;
    public abstract isReadonly: boolean;

    public definition?: OAProperty;
    setDefinition(definition: IOAProperty): void {
        this.definition = definition as OAProperty;
    }

    constructor(
        name: string,
    ) {
        super(name);
    }

    public toOpenApi() {
        return {
            [this.name]: this.propertyType.toOpenApi(),
        }
    }

    [util.inspect.custom]() {
        return {
            name: this.name,
            propertyType: this.propertyType.referencedTypeName,
            isOptional: this.isOptional,
        }
    }
}

