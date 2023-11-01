import { TsTypeOwner } from "~/openapi/ts-parser/model";
import { ITsProperty, ITsMethod, ITsType } from "../../model";
import { TsGenericsList } from "../../ts-generics-list/ts-generics-list";
import { TsTypeBase } from "../ts-type";

export class TsUnionServiceType extends TsTypeBase {
    public readonly isGeneric = false;
    public readonly isUnion = true;
    public isIntersection = false;
    public genericList: TsGenericsList;
    properties?: ITsProperty[];
    methods?: ITsMethod[];
    referencedTypeName?: string;
    unionTypes?: ITsType[] = [];
    intersectTypes?: ITsType[];
    genericBase?: ITsType;
    owner?: TsTypeOwner;

    constructor(firstElement: ITsType) {
        super('union-type');
        this.unionTypes = [firstElement];
    }

    toOpenApi(): { [key: string]: any; } {
        return {
            'oneOf': this.unionTypes.map(t => t.toOpenApi()),
        };
    }

    getLatestUnion(): ITsType {
        return this.unionTypes[this.unionTypes.length - 1];
    }

    addUnionItem(member: ITsType): void {
        if (!this.unionTypes) {
            this.unionTypes = [];
        }
        if (member.isUnion) {
            this.unionTypes.push(...member.unionTypes);
        } else {
            this.unionTypes.push(member as ITsType);
        }
    }

    intersectWith(type: ITsType): void {
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