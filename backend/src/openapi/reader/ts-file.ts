import { TsClass } from '../ts-parser/ts-types/ts-type-definitions/ts-class-definition/ts-class-definition';
import { TsBaseTypeDefinition } from '../ts-parser/ts-types/ts-type-definitions/ts-base-type-definition';
import { TsVariable } from '../ts-parser/ts-variable/ts-variable';
import { TsFunction } from '../ts-parser/ts-functions/ts-function/ts-function';
import { IOAModule, IOARoute, IOASchema, IOATag } from '../components/model';
import { ITsEntity } from '../ts-parser/model';
import { TsTypeService } from '../services/ts-type.service';

export abstract class TsFile {
    public get types():TsBaseTypeDefinition[] {
        return this.items.filter(item => item instanceof TsBaseTypeDefinition) as TsBaseTypeDefinition[];
    };

    public get classes(): TsClass[] {
        return this.items.filter(item => item instanceof TsClass) as TsClass[];
    }

    public get functions(): TsFunction[] {
        return this.items.filter(item => item instanceof TsFunction) as TsFunction[];
    };

    public get variables(): TsVariable[] {
        return this.items.filter(item => item instanceof TsVariable) as TsVariable[];
    };


    constructor(
        public readonly fileName: string,
        public readonly tags: IOATag[],
        public readonly schemas: IOASchema[],
        public readonly routes: IOARoute[],
        public readonly items: ITsEntity[],
        public moduleDefinition?: IOAModule,
    ) {
        TsTypeService.getService().registerFile(this);
    }


}
