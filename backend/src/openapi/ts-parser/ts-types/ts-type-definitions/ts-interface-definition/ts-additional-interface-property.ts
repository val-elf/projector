import { TsProperty } from '../../ts-property';
import { ITsType } from '../../model';

export class TsAddtitionalInterfaceProperty extends TsProperty {
    public readonly keyType: ITsType;
    public readonly isReadonly: boolean;
    public readonly isOptional: boolean;
    public readonly propertyType: ITsType;

    constructor(keyName: string, keyType: ITsType, propertyType: ITsType) {
        super(keyName);
        this.isReadonly = false;
        this.isOptional = false;
        // this.decorators = decorators;
        this.keyType = keyType;
        this.propertyType = propertyType;
    }

    public toOpenApi(): { [key: string]: any; } {
        return this.propertyType.toOpenApi();
    }
}