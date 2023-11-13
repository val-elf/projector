import { mergeDeep } from "~/openapi/utils";
import { TsGenericsList } from "../../ts-generics-list/ts-generics-list";
import { TsGenericServiceType } from "./ts-generic-service-type";
import { ITsProperty } from "../../model";
import { TsGenericParameterItem } from "../../ts-generics-list/ts-generic-parameter-item";
import { TsTypeService } from "~/openapi/services/ts-type.service";

export class TsPickServiceType extends TsGenericServiceType {
    public override get properties(): ITsProperty[] {
        const [sourceType, extractFields] = this.genericList as unknown as TsGenericParameterItem[];
        const { itemType } = sourceType;
        const { itemType: extractType } = extractFields;
        const extractFieldsNames = extractType.isUnion ? extractType.unionTypes.map(type => type.referencedTypeName) : [extractType.referencedTypeName];
        const tsTypeSerivce = TsTypeService.getService();
        const originType = tsTypeSerivce.findTsTypeDefinition(itemType.referencedTypeName);

        const properties = (originType?.properties ?? []).filter(p => extractFieldsNames.includes(p.name));
        return [...properties];
    }

    toOpenApi(genericParameters?: TsGenericsList): { [key: string]: any; } {
        const properties = this.properties.reduce((acc, p) => mergeDeep(acc, p.toOpenApi(genericParameters)), {});
        return {
            type: 'object',
            ...(Object.keys(properties).length > 0 ? properties : {})
        }
    }
}