import { ETsEntityTypes, ITsReader, TsEntity } from '~/openapi/ts-parser/ts-readers/model';
import { TsProperty } from '../../ts-property';
import { TsDecorator } from '~/openapi/ts-parser/ts-decorator';
import { TsPropertyParser } from '~/openapi/ts-parser/ts-type/ts-property/ts-property-parser';
import { IOpenApiGather } from '~/openapi/components/model';

export class TsClassProperty extends TsProperty {
    public readonly value: TsEntity | ETsEntityTypes | undefined;
    public readonly accessMofidyer: ETsEntityTypes;
    public readonly isStatic: boolean;
    public readonly isAbstract: boolean;
    public readonly isReadonly: boolean;
    public readonly isOptional: boolean;
    public readonly decorators?: TsDecorator[];

    constructor(name: string, value: string);
    constructor(
        reader: ITsReader,
        name: string,
        accessMofidyer: ETsEntityTypes,
        isStatic: boolean,
        isAbstract: boolean,
        isReadonly: boolean,
        isOptional: boolean,
        decorators?: TsDecorator[]
    );
    constructor(...args: any[]) {
        if (args.length === 2) {
            super(args[0]);
            this.value = args[1];
        } else {
            const reader = new TsPropertyParser(args[0]);
            super(args[1]);
            this.accessMofidyer = args[2];
            this.isStatic = args[3];
            this.isAbstract = args[4];
            this.isReadonly = args[5];
            this.isOptional = args[6];
            this.decorators = args[7];

            this.propertyType = reader.propertyType;
            this.value = reader.propertyValue;
        }
    }

    public toOpenApi(gatherer: IOpenApiGather): { [key: string]: any } {
        return {
            [this.name]: this.propertyType?.toOpenApi(gatherer) ??
                ((this.value as any).toOpenApi ? (this.value as any).toOpenApi() : undefined) ??
                { type: 'unknown' },
        }
    }
}