import { TsEntity } from "../../model";
import { ETsEntityTypes } from "../../ts-readers/model";
import { ITsType } from "../model";
import { ITsGenericItem, TsGenericOwners } from "./model";

import util from 'util';

export class TsGenericParameterItem extends TsEntity implements ITsGenericItem {
    public readonly entityType = ETsEntityTypes.GenericItem;
    public name: string;
    public readonly itemType: ITsType;

    constructor(
        name: string | ITsType,
        public readonly extendsType: ITsType | undefined,
        public readonly owner: TsGenericOwners,
    ) {
        super(typeof name === 'string' ? name : name.referencedTypeName);
        this.itemType = typeof name === 'string' ? undefined : name;
    }


    [util.inspect.custom]() {
        return {
            name: this.name,
            extendsType: this.extendsType?.referencedTypeName ?? '',
            itemType: this.itemType,
            owner: this.owner,
        }
    }
}