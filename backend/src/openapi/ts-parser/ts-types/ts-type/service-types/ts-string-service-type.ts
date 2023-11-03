import { TsTypeOwner } from "~/openapi/ts-parser/model";
import { ITsProperty, ITsMethod, ITsType } from "../../model";
import { TsGenericsList } from "../../ts-generics-list/ts-generics-list";
import { TsTypeBase } from "../ts-type";

export class TsStringServiceType extends TsTypeBase {
    isGeneric: boolean;
    isUnion: boolean;
    isIntersection: boolean;
    genericList: TsGenericsList;
    properties?: ITsProperty[];
    methods?: ITsMethod[];
    unionTypes?: ITsType[];
    intersectTypes?: ITsType[];
    genericBase?: ITsType;
    owner?: TsTypeOwner;

    constructor(public readonly referencedTypeName: string) {
        super('string');
    }

    toOpenApi(): { [key: string]: any; } {
        return {};
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