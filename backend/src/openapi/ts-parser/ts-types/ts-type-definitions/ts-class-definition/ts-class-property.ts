import { ETsEntitySymbolTypes } from '~/openapi/ts-parser/ts-readers/model';
import { TsProperty } from '../../ts-property';
import { TsDecorator } from '~/openapi/ts-parser/ts-decorator';
import { ITsExpression } from '~/openapi/ts-parser/model';
import { TsClass } from './ts-class-definition';

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

    public toOpenApi(): { [key: string]: any } {
        return {
            [this.name]: this.propertyType?.toOpenApi() ??
                ((this.value as any).toOpenApi ? (this.value as any).toOpenApi() : undefined) ??
                { type: 'unknown' },
        }
    }
}