import { ITsEntity } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { TsExtendsList } from "../ts-extends-list";
import { TsTypeBase } from "../../../ts-type/ts-type";
import { TsTypeParser } from "../../../ts-type/parsers/ts-type-parser";
import { TsInterfaceDefinition } from "../..";

export class TsExtendsListParser extends TsParserBase {

    public static readExtendsList(parser: ITsParser, owner: TsInterfaceDefinition): TsExtendsList {
        const extendsListParser = new TsExtendsListParser(parser, owner);
        try {
            console.groupCollapsed('Read extends list', extendsListParser.current.substring(0, 20));
            return extendsListParser.readExtendsList();
        } finally {
            console.groupEnd();
        }
    }

    constructor(parent: ITsParser, private owner: TsInterfaceDefinition) {
        super(parent);
    }

    protected readExtendsList() {
        const result = new TsExtendsList();
        while(true) {
            const entity = this.readEntity(result);
            if (entity === null) break;
            if (entity instanceof TsTypeBase) {
                result.push(entity);
            }
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, extendsList: TsExtendsList): ITsEntity {
        const result = super.analyseEntity(entity, entityType, extendsList);
        if (result) return result;
        // console.log('REading next element in extends list', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                return TsTypeParser.readType(this);
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                break;
            default:
                return null
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const enityType = super.defineEntityType(entity);
        if (enityType) return enityType;

        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}