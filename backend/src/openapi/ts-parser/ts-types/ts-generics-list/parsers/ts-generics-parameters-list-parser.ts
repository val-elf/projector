import { ITsType } from "../..";
import { ITsEntity } from "../../../model";
import { TsParserBase } from "../../../ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "../../../ts-readers/model";
import { TsTypeParser } from "../../ts-type/parsers/ts-type-parser";
import { ITsGenericItem, TsGenericOwners } from "../model";
import { TsGenericParameterItem } from "../ts-generic-parameter-item";
import { TsGenericsList } from "../ts-generics-list";

export class TsGenericsParametersListParser extends TsParserBase {
    private isInitialState = true;
    private genericType: ITsType;
    private extendsType: ITsType;

    constructor(
        parser: ITsParser,
        private owner: ITsType,
    ) {
        super(parser);
    }

    public static getGenericsList(parser: ITsParser, owner: ITsType): TsGenericsList {
        const genericParser = new TsGenericsParametersListParser(parser, owner);
        try {
            console.group('Read parametric generics list');
            return genericParser.readGenericsList();
        } finally {
            console.groupEnd();
        }
    }

    public static createGenericsListByInstances(owner: TsGenericOwners, ...generics: ITsType[]) {
        const result = new TsGenericsList(owner);
        result.push(...generics.map(g => new TsGenericParameterItem(g, undefined, owner)));
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

        //console.log('Entity for reading generic list', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
            case ETsEntitySymbolTypes.OpenBrace:
            case ETsEntitySymbolTypes.String:
                // this.index += entity.length;
                this.genericType = TsTypeParser.readType(this);
                break;
            case ETsEntitySymbolTypes.GenericClose: {
                this.index += entity.length;
                const { genericType, extendsType } = this.extractParameters();
                items.push(new TsGenericParameterItem(genericType, extendsType, this.owner));
                return null;
            }
            case ETsEntitySymbolTypes.Comma: {
                this.index += entity.length;
                const { genericType, extendsType } = this.extractParameters();
                items.push(new TsGenericParameterItem(genericType, extendsType, this.owner));
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
        if (entity === '"') return ETsEntitySymbolTypes.String;

        if (this.isInitialState && /^\w+$/.test(entity.trim())) {
            this.isInitialState = false;
            return ETsEntitySymbolTypes.EntityName;
        }
    }

    protected extractParameters() {
        const pExtracts = super.extractParameters();
        const { genericType, extendsType } = this;
        this.genericType = undefined;
        this.extendsType = undefined;
        return {
            ...pExtracts,
            genericType,
            extendsType,
        };

    }
}
