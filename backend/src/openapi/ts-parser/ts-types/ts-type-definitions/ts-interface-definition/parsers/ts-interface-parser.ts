import { ETsEntitySymbolTypes, ETsEntityTypes, ITsParser, TReadEntityResult } from '../../../../ts-readers/model';
import { TsParserBase } from '../../../../ts-readers/ts-parser-base';
import { TsEntity, TsEntityNamed } from '../../../../model';
import { TsExtendsList } from '../ts-extends-list';
import { TsTypeParser } from '../../../ts-type/parsers/ts-type-parser';
import { ITsType } from '../../../model';
import { TsInterfaceDefinition } from '../ts-interface-definition';
import { TsGenericsList } from '../../../ts-generics-list/ts-generics-list';
import { TsExtendsListParser } from './ts-extends-list-parser';
import { OpenApiInstance } from '~/openapi/components';
import { TsTypeService } from '~/openapi/services/ts-type.service';
import { TsGenericsArgumentsListParser } from '../../../ts-generics-list/parsers/ts-generics-arguments-list-parser';

enum EReadMode {
    Undefined = 'undefined',
    ReadInterfaceName = 'read-interface-name',
}

class TsInterfaceDefinitionImpl extends TsInterfaceDefinition {
    constructor(isExport: boolean) {
        super('', isExport);
    }

    populateInterfaceName(name: string) {
        this.name = name;
    }

    populateGenericTypes(genericTypes: TsGenericsList) {
        this._genericList = genericTypes;
    }

    populateExtendType(extendsList: TsExtendsList) {
        this.extendsList = extendsList;
    }

    populateInterfaceType(type: ITsType) {
        this._type = type;
        type.properties.forEach(prop => {
            const propType = prop.propertyType;
            if (!TsTypeService.isBuiltinType(propType) && propType.referencedTypeName) {
                OpenApiInstance.addDependency(this.name, prop.propertyType);
            }
        });
    }
}

export class TsInterfaceParser extends TsParserBase {

    public static readInterfaceDefinition(parent: ITsParser, isExport: boolean = false): TsInterfaceDefinition {
        const parser = new TsInterfaceParser(parent);
        try {
            console.group('Read interface definition');
            return parser.readInterfaceDefinition(isExport);
        } finally {
            console.groupEnd();
        }
    }

    private readInterfaceDefinition(isExport: boolean = false): TsInterfaceDefinition {
        const result = new TsInterfaceDefinitionImpl(isExport);
        while(true) {
            const entity = this.readEntity(result) as TsEntity;

            switch(entity?.entityType) {
                case ETsEntityTypes.EntityName:
                    result.populateInterfaceName(entity.name);
                    break;
                case ETsEntityTypes.GenericsList:
                    if (entity instanceof TsGenericsList) {
                        result.populateGenericTypes(entity);
                    }
                    break;
                case ETsEntityTypes.TypeList:
                    if (entity instanceof TsExtendsList) {
                        result.populateExtendType(entity);
                    }
                    break;
                case ETsEntityTypes.Type:
                    result.populateInterfaceType(entity as unknown as ITsType);
                    break;
            }
            if (!entity || entity.entityType === ETsEntityTypes.Type) {
                break;
            }
        }
        return result;
    }

    // private readMode: EReadMode = EReadMode.Undefined;

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, owner: TsInterfaceDefinitionImpl): TReadEntityResult {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        // console.log('Reading entity in reading interface definition', entity, entityType);

        switch(entityType) {
            case ETsEntitySymbolTypes.Interface:
                this.index += entity.length;
                // this.readMode = EReadMode.ReadInterfaceName;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                // this.readMode = EReadMode.Undefined;
                return new TsEntityNamed(entity);
            case ETsEntitySymbolTypes.Extends:
                this.index += entity.length;
                return this.readExtendsList(owner);
            case ETsEntitySymbolTypes.GenericOpen:
                this.index += entity.length;
                return this.readGenerics(owner);
            case ETsEntitySymbolTypes.OpenBrace:
                const resultType = TsTypeParser.readType(this, owner);
                return resultType;

        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        if (entity === 'interface') return ETsEntitySymbolTypes.Interface;
        if (entity === 'extends') return ETsEntitySymbolTypes.Extends;
        if (entity === '{') return ETsEntitySymbolTypes.OpenBrace;
        if (entity === '<') return ETsEntitySymbolTypes.GenericOpen;
        if (/[\w+]/.test(entity)) return ETsEntitySymbolTypes.EntityName;
    }

    private readGenerics(owner: TsInterfaceDefinition): TsGenericsList {
        return TsGenericsArgumentsListParser.getGenericsList(this, owner);
    }

    private readExtendsList(owner: TsInterfaceDefinition): TsExtendsList {
        return TsExtendsListParser.readExtendsList(this, owner);
    }
}