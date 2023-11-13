import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { ITsGenericItem, TsGenericOwners } from "../model";
import { TsGenericsList } from "../ts-generics-list";
import { TsGenericArgumentItem } from "../ts-generic-argument-item";
import { ITsType } from "../../model";
import { ITsEntity } from "~/openapi/ts-parser/model";
import { TsTypeParser } from "../../ts-type/parsers/ts-type-parser";

export class TsGenericsArgumentsListParser extends TsParserBase {
    private isInitialState = true;
    private genericName: string;
    private extendsType: ITsType;

    constructor(
        parser: ITsParser,
        private owner: TsGenericOwners,
    ) {
        super(parser);
    }

    public static getGenericsList(parser: ITsParser, owner: TsGenericOwners): TsGenericsList {
        const genericParser = new TsGenericsArgumentsListParser(parser, owner);
        try {
            console.group('Read arguments generics list');
            return genericParser.readGenericsList();
        } finally {
            console.groupEnd();
        }
    }

    public static createGenericsListByInstances(owner: TsGenericOwners, ...generics: ITsType[]) {
        const result = new TsGenericsList(owner);
        result.push(...generics.map(g => new TsGenericArgumentItem(g, undefined, owner)));
        return result;
    }

    public readGenericsList(): TsGenericsList {
        const items: ITsGenericItem[] = [];
        const result = new TsGenericsList(this.owner);
        while(true) {
            const entity = this.readEntity(items) as ITsEntity;
            if (entity === null) break;
            // if (entity) items.push(entity as TsGenericItem)
        }
        result.push(...items);
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, items: ITsGenericItem[]): ITsEntity {
        let eResult = super.analyseEntity(entity, entityType);
        if (eResult) return eResult;

        // console.log('Entity for reading generic list', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                this.genericName = entity;
                break;
            case ETsEntitySymbolTypes.Extends:
                this.index += entity.length;
                this.extendsType = TsTypeParser.readType(this);
                break;
            case ETsEntitySymbolTypes.GenericClose: {
                this.index += entity.length;
                const { genericName, extendsType } = this.extractParameters();
                items.push(new TsGenericArgumentItem(genericName, extendsType, this.owner));
                return null;
            }
            case ETsEntitySymbolTypes.Comma: {
                this.index += entity.length;
                const { genericName, extendsType } = this.extractParameters();
                items.push(new TsGenericArgumentItem(genericName, extendsType, this.owner));
                break;
            }

            default:
                // console.log('Unknown entity type (generics list reading):', entityType, entity);
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        const pentity = super.defineEntityType(entity);
        if (pentity) return pentity;

        if (entity === ',') {
            this.isInitialState = true;
            return ETsEntitySymbolTypes.Comma;
        }

        if (entity === '>') return ETsEntitySymbolTypes.GenericClose;
        if (entity === 'extends') return ETsEntitySymbolTypes.Extends;
        if (entity === '"') return ETsEntitySymbolTypes.String;

        if (this.isInitialState && /^\w+$/.test(entity.trim())) {
            this.isInitialState = false;
            return ETsEntitySymbolTypes.EntityName;
        }
    }

    protected extractParameters() {
        const pExtracts = super.extractParameters();
        const { genericName, extendsType } = this;
        this.genericName = undefined;
        this.extendsType = undefined;
        return {
            ...pExtracts,
            genericName,
            extendsType,
        };

    }


}