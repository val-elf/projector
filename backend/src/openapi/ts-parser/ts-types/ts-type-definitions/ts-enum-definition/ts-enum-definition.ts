import { ITsDecorator } from '~/openapi/ts-parser/model';
import { ITsProperty } from '../../model';
import { TsBaseTypeDefinition } from '../ts-base-type-definition';
import { TsEnumProperty } from './ts-enum-property';

export abstract class TsEnumDefinition extends TsBaseTypeDefinition {

    protected propertyKeyName = 'enum';
    private  _properties: ITsProperty[] = [];

    public get properties(): ITsProperty[] {
        return this._properties;
    }

    public addProperties(properties: ITsProperty[]): void {
        this._properties.push(...properties);
    }

    constructor(
        name: string,
        isExport: boolean,
        decorators?: ITsDecorator[],
    ) {
        super(name, isExport, decorators);
    }

    public get typeName(): string {
        return 'string';
    }

    /*protected outProperty(prop: ITsProperty): [string] {
        const enumProperty = prop as TsEnumProperty;
        return [enumProperty.value];
    }*/

    public propertiesToOpenApi(): { [key: string]: any[]; } {
        return {
            [this.propertyKeyName]: this.properties.map(prop => {
                const enumProperty = prop as TsEnumProperty;
                return enumProperty.value;
            }),
        };
    }

    public override toOpenApi(): { [key: string]: string | number | object; } {
        const result = super.toOpenApi();
        return result;
    }
}

