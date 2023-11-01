import { CommonOADefinition } from './common-oa-definition';
import { TsBaseTypeDefinition } from '../ts-parser/ts-types/ts-type-definitions/ts-base-type-definition';
import { IOpenApiSerializable, IOASchema, OADefinition, EDeclarationType } from './model';
import { ETsEntityTypes } from '../ts-parser/ts-readers/model';

export class OASchema extends OADefinition implements IOASchema, IOpenApiSerializable {
    private _name: string;
    public get name(): string {
        return this._name ?? this.entity.name;
    };

    public readonly description: string;

    public readonly aliasType?: string;
    public readonly type: EDeclarationType = EDeclarationType.Schema;
    public entityType: ETsEntityTypes = ETsEntityTypes.OADefinition;
    public entity: TsBaseTypeDefinition;

    constructor(
        data: CommonOADefinition,
    ) {
        super(data);
        this.type = data.name;
        this._name = data.properties.name as string;
        this.aliasType = data.properties.type as string;
        this.description = data.properties.description as string;
    }

    public setEntityOwner(entity: TsBaseTypeDefinition) {
        if (!(entity instanceof TsBaseTypeDefinition)) {
            console.error('Entity is wrong', entity);
            throw new Error('Entity must be instance of TsBaseTypeDefinition');
        }
        this.entity = entity;
    }

    public toOpenApi() {
        const { description } = this;
        const expValue = this.entity.toOpenApi();
        Object.assign(Object.values(expValue)[0], {
            description,
        });
        return expValue;
    }
}