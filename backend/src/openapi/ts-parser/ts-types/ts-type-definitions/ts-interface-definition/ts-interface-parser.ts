import { ETsEntitySymbolTypes, ETsEntityTypes, ITsParser, TReadEntityResult } from '../../../ts-readers/model';
import { TsParserBase } from '../../../ts-readers/ts-parser-base';
import { TsType } from '../../ts-type/ts-type';
import { TsEntity } from '../../../model';
import { TsGenericsTypeList } from './ts-generics-type-list';
import { TsExtendType } from './ts-extend-type';

enum EReadMode {
    Undefined = 'undefined',
    ReadInterfaceName = 'read-interface-name',
}

export class TsInterfaceParser extends TsParserBase {

    private entityName: string;

    constructor(parser: ITsParser) {
        super(parser);
    }

    public readInterfaceDefinition(): { interfaceName: string, genericTypes: TsType[], extendType?: TsType, interfaceType: TsType } {
        const result = {
            interfaceName: '',
            genericTypes: [],
            extendType: undefined,
            interfaceType: undefined,
        };
        while(true) {
            const entity = this.readEntity() as TsEntity;
            console.log('Find entity', entity);
            switch(entity?.entityType) {
                case ETsEntityTypes.EntityName:
                    result.interfaceName = entity.name;
                    break;
                case ETsEntityTypes.TypeList:
                    if (entity instanceof TsGenericsTypeList) {
                        result.genericTypes = entity.genericsList;
                    } else if (entity instanceof TsExtendType) {
                        result.extendType = entity;
                    }
                    break;
                case ETsEntityTypes.Type:
                    result.interfaceType = entity;
                    break;
            }
            if (!entity || entity.entityType === ETsEntityTypes.Type) {
                break;
            }
        }
        console.log('Interface read result:', result);
        return result;
        /*const match = definition.match(/^interface\s+([^<]+?)(<(.+?)>)?(extends\s+(.+))?\s*$/);
        if (match) {
            this.name = match[1].trim();
            this.isGeneric = !!match[2];
            this.genericTypes = match[3]?.split(',').map(t => t.trim()) ?? [];
            this.extendsTypes = match[5]?.split(',').map(t => t.trim()) ?? [];
        }*/
    }

    private readMode: EReadMode = EReadMode.Undefined;

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): TReadEntityResult {
        const result = super.analyseEntity(entity, entityType);
        console.log('Analyse entity', entity, entityType);
        if (result) return result;

        switch(entityType) {
            case ETsEntitySymbolTypes.Interface:
                this.index += entity.length;
                this.readMode = EReadMode.ReadInterfaceName;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                this.readMode = EReadMode.Undefined;
                return new TsEntity(entity, ETsEntityTypes.EntityName);
            case ETsEntitySymbolTypes.Extends:
                return this.readExtendsList();
            case ETsEntitySymbolTypes.GenericOpen:
                return this.readGenerics();
            case ETsEntitySymbolTypes.OpenBrace:
                return new TsType(this);

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

    protected extractParameters(): any {
        const { attributes, decorators } = super.extractParameters();
        this.attributes = {};
        this.decorators = [];
        const { entityName } = this;
        this.entityName = undefined
        return { attributes, decorators, entityName };
    }

    private readGenerics(): TsGenericsTypeList {
        const genericsList = this.readToBalanced('>', true);
        console.log('Generics list', genericsList);
        return new TsGenericsTypeList([]);
    }

    private readExtendsList(): TsExtendType {
        const extendType = this.expectOf(/\s/, true);
        console.log('Extends list is', extendType);
        return new TsExtendType(extendType);

    }
}