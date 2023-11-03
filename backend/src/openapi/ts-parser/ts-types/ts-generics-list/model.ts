import { TsTypeOwner } from "../../model";
import { ITsType } from "../model";

export interface ITsGenericItem {
    name: string;
}

export type TsGenericOwners = TsTypeOwner | ITsType;
