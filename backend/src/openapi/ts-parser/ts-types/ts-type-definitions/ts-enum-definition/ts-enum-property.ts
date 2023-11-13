import { ETsEntityTypes } from '~/openapi/ts-parser/ts-readers/model';
import { TsEntity } from '~/openapi/ts-parser/model';
import { ITsProperty } from '../../model';
import { TsTypeParser } from '../../ts-type/parsers/ts-type-parser';
import { OAProperty } from '~/openapi/components/oa-property';
import { TsTypeService } from '~/openapi/services/ts-type.service';

export class TsEnumProperty extends TsEntity implements ITsProperty {
    public readonly entityType = ETsEntityTypes.Property;

    public propertyType = TsTypeService.String;
    public isOptional = true;
    public isReadonly = true;
    public definition?: OAProperty;

    constructor(
        public name: string,
        public value: string,
    ) {
        super(name);
    }

    public setDefinition(definition: OAProperty): void {
        this.definition = definition as OAProperty;
    }

    toOpenApi(): { [key: string]: string | number | object; } {
        return {
            [this.name]: this.value,
        };
    }
}