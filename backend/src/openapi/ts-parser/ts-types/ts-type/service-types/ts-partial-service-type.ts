import { TsDecorator } from "~/openapi/ts-parser/ts-decorator";
import { ITsProperty, ITsType } from "../../model";
import { TsProperty } from "../../ts-property";
import { TsGenericServiceType } from "./ts-generic-service-type";
import { TsGenericParameterItem } from "../../ts-generics-list/ts-generic-parameter-item";

class TsOptionalPropertyProxy extends TsProperty {
    constructor(private parent: ITsProperty) {
        super(parent.name);
    }

    public isOptional: boolean = true;
    public get isReadonly(): boolean { return this.parent.isReadonly; }
    public get propertyType(): ITsType { return this.parent.propertyType; }
    public get decorators(): TsDecorator[] { return (this.parent as any).decorators; }
}

export class TsPartialServiceType extends TsGenericServiceType {
    public override get properties(): ITsProperty[] {
        const [sourceType] = this.genericList as unknown as TsGenericParameterItem[];
        const { itemType } = sourceType;
        const properties = (itemType?.properties ?? []).map(p => new TsOptionalPropertyProxy(p));
        return [...properties];
    }
}