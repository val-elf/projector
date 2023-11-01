import { TsTypeService } from "~/openapi/services/ts-type.service";
import { ITsType, ITsMethod, ITsProperty } from "../../model";
import { TsGenericsList } from "../../ts-generics-list/ts-generics-list";
import { TsTypeBase } from "../ts-type";
import { TsTypeOwner } from "~/openapi/ts-parser/model";

export class TsGenericServiceType extends TsTypeBase {
    public readonly isGeneric = true;
    public readonly isUnion = false;
    public readonly isIntersection = false;
    public readonly methods: ITsMethod[] = [];

    referencedTypeName?: string;
    public readonly unionTypes: ITsType[] = [];
    public readonly intersectTypes: ITsType[] = [];
    public readonly owner?: TsTypeOwner;

    public get properties(): ITsProperty[] {
        return [];
    };

    constructor(
        public readonly genericBase: ITsType,
        public readonly genericList: TsGenericsList
    ) {
        super('generic-type');
    }

    toOpenApi(): { [key: string]: any; } {
        const { genericBase, genericList } = this;
        if (genericBase === TsTypeService.ArrayType) {
            return {
                type: 'array',
                items: genericList[0].itemType.toOpenApi(),
            };
        } else if (genericBase === TsTypeService.PromiseType) {
            return genericList[0].itemType.toOpenApi();
        }
    }

    getLatestUnion(): ITsType {
        throw new Error("Method not implemented.");
    }
    intersectWith(type: ITsType): void {
        throw new Error("Method not implemented.");
    }
    addUnionItem(member: ITsType): void {
        throw new Error("Method not implemented.");
    }
    populateMethods(methods: ITsMethod[]): void {
        throw new Error("Method not implemented.");
    }
    populateProperties(properties: ITsProperty[]): void {
        throw new Error("Method not implemented.");
    }
    populateReferenceName(name: string): void {
        throw new Error("Method not implemented.");
    }
}