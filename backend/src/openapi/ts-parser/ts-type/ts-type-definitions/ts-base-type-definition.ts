import { IOpenApiGather, IOpenApiSerializable } from '~/openapi/components/model';
import { TsDecorator } from '../../ts-decorator';
import { ETsEntityTypes, ITsReader, TsEntity } from '../../ts-readers/model';
import { TsType } from '../ts-type';
import { ITsProperty } from '../ts-property';
import { CommonOADefinition } from '~/openapi/components';

export abstract class TsBaseTypeDefinition extends TsEntity implements IOpenApiSerializable {
    protected _contextGatherer: IOpenApiGather;
    protected _type: TsType;
    protected propertyKeyName = 'properties';

    protected abstract get typeName(): string;
    protected data: CommonOADefinition

    protected constructor(
        protected reader: ITsReader,
        public readonly isExport: boolean,
        public readonly decorators?: TsDecorator[],
    ) {
        super('', ETsEntityTypes.TypeDefinition);
        this.read(this.reader);
    }

    public setOAData(data: CommonOADefinition) {
        this.data = data;
    }

    public setCurrentGatherer(gatherer: IOpenApiGather) {
        this._contextGatherer = gatherer;
    }

    protected abstract read(reader: ITsReader);

    protected get properties(): ITsProperty[] {
        return this._type?.properties ?? [];
    };

    private preparePropertiesToOutput(gatherer: IOpenApiGather): { [key: string]: {} ; } {
        return {
            [this.propertyKeyName]: this.properties?.reduce((acc, prop) => ({
                ...acc,
                ...prop.toOpenApi(gatherer),
            }), {}) ?? {},
        };
    }

    toOpenApi(gatherer: IOpenApiGather): { [key: string]: string | number | object; } {
        if (gatherer === undefined) {
            throw new Error('Gatherer is undefined');
        }
        this._contextGatherer = gatherer;
        // const required = this._type?.getRequiredProperties().map(p => p.name) ?? [];
        const properties = this.preparePropertiesToOutput(gatherer);
        const required = this.properties.filter(p => !p.isOptional).map(p => p.name);

        if (this._type) {
            console.log('Out type', this._type);
            return {
                [this.name]: this._type.toOpenApi(gatherer),
            }
        }

        return {
            [this.name]: {
                type: this.typeName,
                ...(Object.keys(properties[this.propertyKeyName]).length > 0 ? { ...properties } : {}),
                ...(required.length > 0 ? { required } : {})
            }
        };
    }
}
