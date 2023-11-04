import { TsBaseTypeDefinition } from '../ts-base-type-definition';
import { ITsProperty } from '../..';
import { TsExtendsList } from './ts-extends-list';
import { TsAddtitionalInterfaceProperty } from './ts-additional-interface-property';
import { TsProperty } from '../../ts-property';
import { TsGenericsList } from '../../ts-generics-list/ts-generics-list';
import { TsTypeService } from '~/openapi/services/ts-type.service';
import { mergeDeep } from '~/openapi/utils';


export abstract class TsInterfaceDefinition extends TsBaseTypeDefinition {
    public extendsList?: TsExtendsList;

    constructor(
        name: string,
        isExport: boolean,
    ) {
        super(name, isExport);
    }

    public get typeName(): string {
        return 'object';
    }

    public get properties(): ITsProperty[] {
        const properties = [...super.properties];
        this.extendsList?.forEach(extendType => {
            if (extendType) {
                properties.push(...extendType.properties);
            }
        });
        return properties;
    }

    public override propertiesToOpenApi(genericParameters?: TsGenericsList): { [key: string]: any[] | any; } {
        const properties = this.properties;

        let result = {
            properties: {},
            additionalProperties: {},
            required: [],
        };
        properties.forEach((prop) => {
            if (prop instanceof TsAddtitionalInterfaceProperty) {
                result.additionalProperties = prop.toOpenApi();
            } else if (prop instanceof TsProperty) {
                if (this.isGeneric && genericParameters) {
                    const propertyTypeName = prop.propertyType.referencedTypeName;
                    const genericItemIndex = this.genericList.findIndex(genericItem => genericItem.name === propertyTypeName);
                    if (genericItemIndex > -1) {
                        const genericParameter = genericParameters[genericItemIndex];
                        const realItemType = TsTypeService.getService().findTsTypeDefinition(genericParameter.name);
                        if (realItemType) {
                            result.properties[prop.name] = realItemType.toOpenApi();
                            return;
                        }
                    }
                }
                const properties = prop.toOpenApi(genericParameters);
                result = mergeDeep(result, properties);
                if (!prop.isOptional) {
                    result.required.push(prop.name);
                }
            }
        });

        return {
            ...(Object.keys(result.properties).length ? { properties: result.properties } : {}),
            ...(Object.keys(result.additionalProperties).length ? { additionalProperties: result.additionalProperties } : {}),
            ...(result.required.length ? { required: result.required } : {}),
        }
    }

    public override toOpenApi(genericParameters?: TsGenericsList): { [key: string]: string | number | object; } {
        // the quiestion is: do we need to make reading properties always
        const res: any = {
            type: this.typeName,
        };

        Object.assign(res, this.propertiesToOpenApi(genericParameters));
        return {
            [this.name]: res,
        };
    }
}