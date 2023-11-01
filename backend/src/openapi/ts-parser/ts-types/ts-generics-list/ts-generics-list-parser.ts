import { ITsType } from "..";
import { ITsEntity } from "../../model";
import { TsParserBase } from "../../ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "../../ts-readers/model";
import { TsTypeParser } from "../ts-type/parsers/ts-type-parser";
import { TsGenericOwners } from "./model";
import { TsGenericItem } from "./ts-generic-item";
import { TsGenericsList } from "./ts-generics-list";

/*class TsGenericsListImpl extends TsGenericsList {
    constructor(owner: TsGenericOwners) {
        super(owner);
    }

    public populateItems(items: TsGenericItem[]) {
        this._genericsList = items;
    }
}*/

export class TsGenericsListParser extends TsParserBase {
    /*private createGenericsListImpl = (owner: TsGenericOwners) => {
        return new TsGenericsListImpl(owner);
    }*/

    private isInitialState = true;
    private genericName: ITsType;
    private extendsType: ITsType;

    constructor(
        parser: ITsParser,
        private owner: TsGenericOwners,
    ) {
        super(parser);
    }

    public static getGenericsList(parser: ITsParser, owner: TsGenericOwners): TsGenericsList {
        const genericParser = new TsGenericsListParser(parser, owner);
        try {
            console.group('Read generics list');
            return genericParser.readGenericsList();
        } finally {
            console.groupEnd();
        }
    }

    public static createGenericsListByInstances(owner: TsGenericOwners, ...generics: ITsType[]) {
        const result = new TsGenericsList(owner);
        result.push(...generics.map(g => new TsGenericItem(g, undefined, owner)));
        return result;
    }

    public readGenericsList(): TsGenericsList {
        const items: TsGenericItem[] = [];
        const result = new TsGenericsList(this.owner);
        while(true) {
            const entity = this.readEntity(items) as ITsEntity;
            if (entity === null) break;
            // if (entity) items.push(entity as TsGenericItem)
        }
        result.push(...items);
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, items: TsGenericItem[]): ITsEntity {
        let eResult = super.analyseEntity(entity, entityType);
        if (eResult) return eResult;

        //console.log('Entity for reading generic list', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
            case ETsEntitySymbolTypes.OpenBrace:
            case ETsEntitySymbolTypes.String:
                // this.index += entity.length;
                this.genericName = TsTypeParser.readType(this);
                break;
            case ETsEntitySymbolTypes.Extends:
                this.index += entity.length;
                this.extendsType = TsTypeParser.readType(this);
                break;
            case ETsEntitySymbolTypes.GenericClose: {
                this.index += entity.length;
                const { genericName, extendsType } = this.extractParameters();
                items.push(new TsGenericItem(genericName, extendsType, this.owner));
                return null;
            }
            case ETsEntitySymbolTypes.Comma: {
                this.index += entity.length;
                const { genericName, extendsType } = this.extractParameters();
                items.push(new TsGenericItem(genericName, extendsType, this.owner));
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
