import { TsBaseTypeDefinition } from '../ts-base-type-definition';
import { OATag } from '~/openapi/components';
import { TsGenericsList } from '../../ts-generics-list/ts-generics-list';
import util from 'util';

export abstract class TsTypeDefinition extends TsBaseTypeDefinition {
    public tag?: OATag;

    public get genericList(): TsGenericsList | undefined {
        return this._genericList;
    }

    constructor(
        name: string,
        isExport: boolean,
        genericList?: TsGenericsList,
    ) {
        super(name, isExport);
        this._genericList = genericList;
    }

    public get typeName(): string {
        const dectype = this.schema?.type;
        return dectype ?? this.name ?? 'object';
    }

    [util.inspect.custom]() {
        return {
            name: this.name,
            isExport: this.isExport,
            isGeneric: this.isGeneric,
            body: this._type,
        }
    }
}
