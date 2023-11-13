import { IOARoute, IPathsDefinition } from '../../../../components/model';
import { ETsEntitySymbolTypes } from '../../../ts-readers/model';
import { TsDecorator } from '../../../ts-decorator';
import { ITsMethod, ITsType } from '../..';
import { TsClass } from './ts-class-definition';
import { TsFunction } from '~/openapi/ts-parser/ts-functions/ts-function/ts-function';
import { ITsParametersList } from '~/openapi/ts-parser/model';
import { TsInterfaceDefinition } from '../ts-interface-definition/ts-interface-definition';
import { TsTypeDefinition } from '../ts-type-definition/ts-type-definition';
import { TsTypeService } from '~/openapi/services/ts-type.service';
import util from 'util';

export abstract class TsClassMethod extends TsFunction implements ITsMethod {
    public get definition(): IOARoute | undefined {
        return this._definition;
    }

    private get isPath(): boolean {
        return this._definition && this.hasDecorator('Route');
    }

    public parameters: ITsParametersList;
    public returnType: ITsType | undefined = TsTypeService.Void;
    public accessModifier: ETsEntitySymbolTypes = ETsEntitySymbolTypes.Public;
    public isStatic: boolean = false;
    public isAsync: boolean = false;
    public isAbstract: boolean = false;
    public isGetter: boolean = false;
    public isSetter: boolean = false;
    public readonly decorators: TsDecorator[] = [];

    private _definition?: IOARoute;

    constructor(
        public readonly methodOwner: TsClass | TsInterfaceDefinition | TsTypeDefinition,
        public name: string,
    ) {
        super(name);
    }

    setDefinition(definition: IOARoute): void {
        this._definition = definition;
        this._definition.setEntityOwner(this);
    }


    public toOpenApi(): IPathsDefinition {
        if (!this.isPath) return {};
        const router = this.definition!;
        return router.toOpenApi();
    }

    public hasDecorator(name: string): boolean {
        return this.decorators?.some(d => d.name === name);
    }

    [util.inspect.custom]() {
        return {
            entityType: this.entityType,
            name: this.name,
            returnType: this.returnType,
            parameters: this.parameters,
            decorators: this.decorators,
            isAbstract: this.isAbstract,
            isAsync: this.isAsync,
            isStatic: this.isStatic,
            isGetter: this.isGetter,
            isSetter: this.isSetter,
            accessModifier: this.accessModifier,
        }
    }
}
