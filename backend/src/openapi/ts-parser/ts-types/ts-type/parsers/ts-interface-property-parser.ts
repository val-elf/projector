import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ITsProperty, ITsType } from "../../model";
import { TsProperty } from "../../ts-property";
import { ITsEntity, TsTypeOwner } from "~/openapi/ts-parser/model";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { TsTypeParser } from "./ts-type-parser";
import { TsInterfaceProperty } from "../../ts-type-definitions/ts-interface-definition/ts-interface-property";
import { TsDecorator } from "~/openapi/ts-parser/ts-decorator";
import { TsTypeService } from "~/openapi/services/ts-type.service";

interface IPropertyData {
    owner: TsTypeOwner;
    name: string;
    isOptional: boolean;
    isReadonly: boolean;
    type: ITsType;
}

export class TsInterfacePropertyParser extends TsParserBase {

    public static readProperty(parent: ITsParser, owner: TsTypeOwner): ITsProperty {
        const parser = new TsInterfacePropertyParser(parent);
        try {
            console.group('Read interface property', (parent as any).current.substring(0, 20));
            return parser.readInterfaceProperty(owner);
        } finally {
            console.log('End of reading user interface property');
            console.groupEnd();
        }
    }

    private readInterfaceProperty(owner: TsTypeOwner): ITsProperty {
        const result = this.readEntity({
            owner,
            name: '',
            isOptional: false,
            isReadonly: false,
            type: TsTypeService.Any
        } as IPropertyData) as TsProperty;
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, propertyData: IPropertyData): ITsEntity {
        const entityResult = super.analyseEntity(entity, entityType, propertyData);
        if (entityResult) return entityResult;

        console.log('Interface property parser readin entity:', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                propertyData.name = entity;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Optional:
                this.index += entity.length;
                propertyData.isOptional = true;
                break;
            case ETsEntitySymbolTypes.Readonly:
                this.index += entity.length;
                propertyData.isReadonly = true;
                break;
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                const type = TsTypeParser.readType(this);
                const { decorators } = this.extractParameters() as { decorators?: TsDecorator[] };
                const property = new TsInterfacePropertyImpl(
                    propertyData.name,
                    propertyData.isReadonly,
                    propertyData.isOptional,
                    type,
                    decorators
                );
                console.log('Retun property');
                return property;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const entityType = super.defineEntityType(entity);
        if (entityType) return entityType;

        if (entity === '?') return ETsEntitySymbolTypes.Optional;
        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (entity === 'readonly') return ETsEntitySymbolTypes.Readonly;
        if (this.isEntityName(entity, true)) return ETsEntitySymbolTypes.EntityName;
    }
}

class TsInterfacePropertyImpl extends TsInterfaceProperty {
    public propertyType: ITsType;
}