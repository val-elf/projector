import { TsGenericsList } from "../../ts-generics-list/ts-generics-list";
import { TsGenericServiceType } from "./ts-generic-service-type";
import { TsOmitServiceType } from "./ts-omit-service-type";
import { ITsType } from "../../model";
import { TsTypeService } from "~/openapi/services/ts-type.service";
import { TsType } from "../ts-type";
import { TsPartialServiceType } from "./ts-partial-service-type";

export class TsGenericsFabric {
    public static getGenericsType(base: ITsType, argumentsList: TsGenericsList): TsGenericServiceType {
        if (base === TsTypeService.OmitType) return new TsOmitServiceType(base, argumentsList);
        if (base === TsTypeService.PartialType) return new TsPartialServiceType(base, argumentsList);
        return new TsGenericServiceType(base, argumentsList);
    }
}