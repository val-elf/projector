import { TsTypeService } from "~/openapi/services/ts-type.service";
import { ITsProperty } from "../../model";
import { TsGenericServiceType } from "./ts-generic-service-type";

export class TsOmitServiceType extends TsGenericServiceType {
    // TODO: implement
    public override get properties(): ITsProperty[] {
        const [sourceType, extractFields] = this.genericList;
        const { itemType } = sourceType;
        const { itemType: extractType } = extractFields;
        const extractFieldsNames = extractType.isUnion ? extractType.unionTypes.map(type => type.referencedTypeName) : [extractType.referencedTypeName];
        const tsTypeSerivce = TsTypeService.getService();
        const originType = tsTypeSerivce.findTsType(itemType.referencedTypeName);

        const properties = (originType?.properties ?? []).filter(p => !extractFieldsNames.includes(p.name));
        return [...properties];
    }
}