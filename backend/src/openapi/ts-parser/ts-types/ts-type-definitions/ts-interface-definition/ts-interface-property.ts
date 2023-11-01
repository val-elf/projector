import { TsProperty } from '../../ts-property';
import { TsDecorator } from '~/openapi/ts-parser/ts-decorator';
import { ITsType } from '../../model';

export abstract class TsInterfaceProperty extends TsProperty {
    public readonly isReadonly: boolean;
    public readonly isOptional: boolean;
    public readonly decorators?: TsDecorator[];
    public readonly propertyType: ITsType;

    constructor(
        name: string,
        isReadonly: boolean,
        isOptional: boolean,
        type: ITsType,
        decorators?: TsDecorator[]
    ) {
        super(name);
        this.isReadonly = isReadonly;
        this.isOptional = isOptional;
        this.decorators = decorators;
        this.propertyType = type;
   }
}
