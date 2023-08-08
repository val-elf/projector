import { CommonOADefinition } from './common-oa-definition';
import { TsBaseTypeDefinition } from '../ts-parser/ts-type/ts-type-definitions/ts-base-type-definition';
import { IOpenApiGather, IOpenApiSerializable, ISchema } from './model';
import { OpenApi } from './openApi';

export class OASchema implements ISchema, IOpenApiSerializable {
    private _name: string;
    public get name(): string {
        return this._name ?? this.entity.name;
    };

    public readonly description: string;

    constructor(
        data: CommonOADefinition,
        public readonly openApi: OpenApi,
        public readonly entity: TsBaseTypeDefinition
    ) {
        if (!(entity instanceof TsBaseTypeDefinition)) {
            console.error('Entity is wrong', entity);
            throw new Error('Entity must be instance of TsBaseTypeDefinition');
        }
        this._name = data.properties.name as string;
        this.description = data.properties.description as string;
        this.entity.setOAData(data);
    }

    toOpenApi(gatherer: IOpenApiGather) {
        const { description } = this;
        // const required = allProperties.filter(p => !p.isOptional).map(p => p.name);
        const expValue = this.entity.toOpenApi(gatherer);
        Object.assign(Object.values(expValue)[0], {
            description,
        });
        return expValue;
    }
}