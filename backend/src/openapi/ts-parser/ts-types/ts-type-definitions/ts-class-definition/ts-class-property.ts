import { ETsEntitySymbolTypes } from '~/openapi/ts-parser/ts-readers/model';
import { TsProperty } from '../../ts-property';
import { TsDecorator } from '~/openapi/ts-parser/ts-decorator';
import { ITsExpression } from '~/openapi/ts-parser/model';
import { TsClass } from './ts-class-definition';
import { TsGenericsList } from '../../ts-generics-list/ts-generics-list';

export abstract class TsClassProperty extends TsProperty {
    public value: ITsExpression<unknown> | undefined;
    public accessModifier: ETsEntitySymbolTypes;
    public isStatic: boolean;
    public isAbstract: boolean;
    public isReadonly: boolean;
    public isOptional: boolean;
    public decorators: TsDecorator[] = [];

    constructor(protected owner: TsClass) {
        super('');
    }

    public toOpenApi(genericParameters?: TsGenericsList): { property: { [key: string]: any }} {
        return {
            property: {
                [this.name]: this.propertyType?.toOpenApi(genericParameters) ??
                    ((this.value as any).toOpenApi ? (this.value as any).toOpenApi(genericParameters) : undefined) ??
                    { type: 'unknown' },
            }
        }
    }
}