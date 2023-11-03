import { IOpenApiSerializable } from '~/openapi/components/model';
import { ETsEntityTypes } from '../../ts-readers/model';
import { OASchema } from '~/openapi/components';
import { ITsDecorator, TsEntity } from '../../model';
import { ITsMethod, ITsProperty, ITsType } from '../model';
import { TsGenericsList } from '../ts-generics-list/ts-generics-list';
import { TsTypeService } from '~/openapi/services/ts-type.service';
import { isArray } from '~/backend/entities/utils';

export abstract class TsBaseTypeDefinition extends TsEntity implements IOpenApiSerializable {
    public readonly entityType = ETsEntityTypes.TypeDefinition;
    protected _type: ITsType;
    protected propertyKeyName = 'properties';
    protected _genericList?: TsGenericsList;
    protected _schema?: OASchema;

    protected abstract get typeName(): string;
    public get definitionType(): ITsType {
        return this._type;
    }

    public get schema(): OASchema | undefined{
        return this._schema;
    }

    public get isGeneric() {
        return this._genericList?.length > 0;
    }

    public get genericList(): TsGenericsList | undefined {
        return this._genericList;
    }

    protected constructor(
        name: string,
        public readonly isExport: boolean,
        public readonly decorators?: ITsDecorator[],
    ) {
        super(name);
        TsTypeService.getService().registerType(this);
    }

    public get properties(): ITsProperty[] | undefined {
        return this._type?.properties;
    };

    public get methods(): ITsMethod[] | undefined {
        return this._type?.methods;
    }

    public applySchema(schema: OASchema) {
        this._schema = schema;
        schema.setEntityOwner(this);
    }

    public getProperty(name: string): ITsProperty | undefined {
        return this.properties.find(p => p.name === name);
    }

    protected outProperty(prop: ITsProperty): { [key: string]: {} ; } | [string]{
        return {
            [prop.name]: prop.propertyType.toOpenApi(),
        };
    }

    public abstract propertiesToOpenApi(genericParameters?: TsGenericsList): { [key: string]: any[] ; };

    toOpenApi(genericParameters?: TsGenericsList): { [key: string]: string | number | object; } {
        if (this.schema && this.schema.aliasType) {
            return {
                [this.name]: {
                    type: this.schema.aliasType,
                }
            }
        }
        if (this._type) {
            return {
                [this.name]: this._type.toOpenApi(),
            }
        }

        const properties = this.propertiesToOpenApi(genericParameters);
        return {
            [this.name]: {
                type: this.typeName,
                ...properties,
            }
        };
    }
}
