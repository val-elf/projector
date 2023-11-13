import { TsTypeOwner } from "~/openapi/ts-parser/model";
import { ITsProperty, ITsMethod, ITsType } from "../../model";
import { TsGenericsList } from "../../ts-generics-list/ts-generics-list";
import { TsTypeBase } from "../ts-type";

export class TsDateServiceType extends TsTypeBase {
    isGeneric: boolean = false;
    isUnion: boolean = false;
    isIntersection: boolean = false;
    genericList: TsGenericsList;
    properties?: ITsProperty[];
    methods?: ITsMethod[];
    referencedTypeName?: string = 'string';
    unionTypes?: ITsType[];
    intersectTypes?: ITsType[];
    genericBase?: ITsType;
    owner?: TsTypeOwner;

    constructor() {
        super('string');
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

    public toOpenApi(): { [key: string]: any; } {
        return {
            type: 'string',
            format: 'date-time',
        };
    }
}