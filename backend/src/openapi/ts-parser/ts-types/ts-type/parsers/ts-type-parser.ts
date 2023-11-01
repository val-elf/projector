import { TsParserBase } from '../../../ts-readers/ts-parser-base';
import { ETsEntitySymbolTypes, ETsEntityTypes, ITsParser, TReadEntityResult } from '../../../ts-readers/model';
import { TsEntityNamed, TsTypeOwner } from '../../../model';
import { ITsType } from '../..';
import { TsInterfaceDefinition } from '../../ts-type-definitions';
import { TsGenericsList } from '../../ts-generics-list/ts-generics-list';
import { TsGenericsListParser } from '../../ts-generics-list/ts-generics-list-parser';
import { TsInterfaceBodyParser } from './ts-interface-body-parser';
import { TsCommentParser } from '~/openapi/ts-parser/ts-comment/ts-comment-parser';
import { TsGenericsFabric } from '../service-types/ts-generics-fabric';
import { TsStringServiceType } from '../service-types/ts-string-service-type';
import { TsUnionServiceType } from '../service-types/ts-union-service-type';
import { TsTypeService } from '~/openapi/services/ts-type.service';
import { TsGenericItem } from '../../ts-generics-list/ts-generic-item';

export class TsTypeParser extends TsParserBase {
    // private readUnionList = false;
    private initialState = true;

    constructor(parserOrDefinition: ITsParser | string, private owner?: TsTypeOwner) {
        super(parserOrDefinition);
    }

    public static readType(reader: ITsParser, owner?: TsTypeOwner): ITsType {
        const _reader = new TsTypeParser(reader, owner);
        let declaration: ITsType;
        try {
            console.group('Read type');
            declaration = _reader.readTypeDeclaration();
            return declaration;
        } finally {
            console.groupEnd();
        }
    }

    private readTypeDeclaration(): ITsType {
        let result: ITsType = TsTypeService.createEmptyType();

        while(true) {
            const entity = this.readEntity(result);
            if (entity === null) break;
            switch(entity.entityType) {
                case ETsEntityTypes.EntityName:
                    result.populateReferenceName(entity.name);
                    break;
                case ETsEntityTypes.GenericsList:
                    const genericBase = result;
                    result = TsGenericsFabric.getGenericsType(genericBase, entity as TsGenericsList);
                    break;
                case ETsEntityTypes.Type:
                    if (this.owner instanceof TsInterfaceDefinition) {
                        return entity as ITsType;
                    } else if (result.isUnion) {
                        result.addUnionItem(entity as ITsType);
                    } else {
                        result = entity as ITsType;
                        continue;
                    }
                    break;
            }
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType: any, result: ITsType): TReadEntityResult {
        const readEntity = super.analyseEntity(entity, entityType);
        if (readEntity) return readEntity;

        // console.log('Reading type, entity is', entity, entityType);
        try {
            switch(entityType) {
                case ETsEntitySymbolTypes.GenericOpen:
                    this.index += entity.length;
                    return TsGenericsListParser.getGenericsList(this, result);

                case ETsEntitySymbolTypes.GenericClose:
                    // CLARIFIED: we do not increment index here
                    // because generics closing should be completed by outer generics list
                    return null;

                case ETsEntitySymbolTypes.OpenBrace:
                    // interface type reading
                    if (this.initialState) {
                        this.index += entity.length;
                        return TsInterfaceBodyParser.readInterfaceImplementation(this, this.owner, result);
                    }

                case ETsEntitySymbolTypes.CloseBrace:
                    // when close brace is applyed to type?
                    // at first glance it should be interrupted
                    //this.index += entity.length;
                    return null;

                case ETsEntitySymbolTypes.Union:
                    this.index += entity.length;
                    const unionSource = (result.isUnion ? result : new TsUnionServiceType(result)) as TsUnionServiceType;
                    const unionNext = TsTypeParser.readType(this, this.owner);
                    unionSource.addUnionItem(unionNext);
                    this.initialState = true;
                    return unionSource;
                case ETsEntitySymbolTypes.Intersection:
                    this.index += entity.length;
                    const intersectionType = TsTypeParser.readType(this, this.owner);
                    if (result.isUnion) {
                        const latestType = result.getLatestUnion();
                        latestType.intersectWith(intersectionType)
                    } else {
                        result.intersectWith(intersectionType);
                    }
                    this.initialState = true;
                    break;

                case ETsEntitySymbolTypes.EntityName:
                    if (this.previousEntityType === ETsEntitySymbolTypes.EntityName) {
                        return null;
                    }
                    this.index += entity.length;

                    const isBuiltinType = this.getBuilinType(entity);
                    if (isBuiltinType) return isBuiltinType;

                    const isGenericType = this.getGeneric(entity);
                    if (isGenericType) return isGenericType;
                    return new TsEntityNamed(entity);

                case ETsEntitySymbolTypes.Readonly:
                    this.modifiers.isReadonly = true;
                    this.index += entity.length;
                    break;

                case ETsEntitySymbolTypes.String:
                    const stringCode = this.readCleanString();
                    return new TsStringServiceType(stringCode);

                case ETsEntitySymbolTypes.OpenSquareBracket:
                    // array definition
                    this.index += entity.length;
                    const genericsList = new TsGenericsList(this.owner);
                    genericsList.push(new TsGenericItem(result, undefined, this.owner));
                    return TsGenericsFabric.getGenericsType(TsTypeService.ArrayType, genericsList);

                case ETsEntitySymbolTypes.CloseSquareBracket:
                    this.index += entity.length;
                    break;

                case ETsEntitySymbolTypes.Comment:
                    TsCommentParser.readComment(this);
                    break;

                case ETsEntitySymbolTypes.Semicolon:
                case ETsEntitySymbolTypes.Export:
                default:
                    return null;
            }
        } finally {
            this.initialState = false;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        let entityType = super.defineEntityType(entity);

        if (entityType) {
            return entityType;
        }
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;

        if (entity === '<') return ETsEntitySymbolTypes.GenericOpen;
        if (entity === '>') return ETsEntitySymbolTypes.GenericClose;
        if (entity === '|') return ETsEntitySymbolTypes.Union;
        if (entity === '&') return ETsEntitySymbolTypes.Intersection;
        if (entity === '"') return ETsEntitySymbolTypes.String;
    }

    private getBuilinType(typeName: string): ITsType | undefined {
        return TsTypeService.findBuiltinByName(typeName);
    }

    private getGeneric(typeName: string): ITsType | undefined {
        return TsTypeService.GENERICS.find(type => type.referencedTypeName === typeName);
    }
}
