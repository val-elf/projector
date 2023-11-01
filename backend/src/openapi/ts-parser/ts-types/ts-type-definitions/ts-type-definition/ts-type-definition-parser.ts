import { TsEntityNamed } from '~/openapi/ts-parser/model';
import { TsParserBase } from '~/openapi/ts-parser/ts-readers';
import { ETsEntitySymbolTypes, ETsEntityTypes, ITsParser, TReadEntityResult } from '~/openapi/ts-parser/ts-readers/model';
import { TsGenericsList } from '../../ts-generics-list/ts-generics-list';
import { TsTypeDefinition } from './ts-type-definition';
import { TsGenericsListParser } from '../../ts-generics-list/ts-generics-list-parser';
import { TsTypeParser } from '../../ts-type/parsers/ts-type-parser';
import { ITsType } from '../../model';

class TsTypeDefinitionImpl extends TsTypeDefinition {
    constructor(isExport: boolean) {
        super('', isExport, undefined);
    }

    public propertiesToOpenApi(): { [key: string]: any[]; } {
        throw new Error('Method not implemented.');
    }

    public populateName(name: string) {
        this.name = name;
    }

    public populateGenericList(genericList: TsGenericsList) {
        this._genericList = genericList;
    }

    public populateType(type: ITsType) {
        this._type = type;
    }
}

export class TsTypeDefinitionParser extends TsParserBase {
    constructor(pasrer: ITsParser) {
        super(pasrer);
    }

    public static readTypeDefinition(parent: ITsParser, isExport: boolean = false): TsTypeDefinition {
        const parser = new TsTypeDefinitionParser(parent);
        console.groupCollapsed('Read type definition');
        try {
            return parser.readTypeDefinition(isExport);
        } finally {
            console.groupEnd();
        }
    }

    public readTypeDefinition(isExport: boolean = false): TsTypeDefinitionImpl {
        const result = new TsTypeDefinitionImpl(isExport);
        while(true) {
            const entity = this.readEntity(result);
            // console.log('Type definition item is:', entity, entity?.entityType);
            if (!entity) break;

            switch(entity.entityType) {
                case ETsEntityTypes.EntityName:
                    result.populateName(entity.name);
                    break;
                case ETsEntityTypes.Type:
                    result.populateType(entity as ITsType)
                    return result;
                case ETsEntityTypes.GenericsList:
                    result.populateGenericList(entity as TsGenericsList);
                    break;
            }
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, typeDefinition: TsTypeDefinition): TReadEntityResult {
        const readEntity = super.analyseEntity(entity, entityType);
        if (readEntity) return readEntity;

        switch(entityType) {
            case ETsEntitySymbolTypes.GenericOpen:
                this.index += entity.length;
                return TsGenericsListParser.getGenericsList(this, typeDefinition);
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                return new TsEntityNamed(entity.trim());
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                return TsTypeParser.readType(this, typeDefinition);
            case ETsEntitySymbolTypes.Semicolon:
                this.index += entity.length;
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined{
        if (entity === '=') return ETsEntitySymbolTypes.TypeDefinition;
        if (entity === '<') return ETsEntitySymbolTypes.GenericOpen;
        if (entity === ';') return ETsEntitySymbolTypes.Semicolon;
        if (/^\s*\w+\s*$/.test(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}