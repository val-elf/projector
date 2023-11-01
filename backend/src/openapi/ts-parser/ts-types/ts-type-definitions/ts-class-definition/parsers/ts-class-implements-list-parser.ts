import { ITsEntity } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { ITsType } from "../../../model";
import { TsType } from "../../../ts-type/ts-type";
import { TsTypeParser } from "../../../ts-type/parsers/ts-type-parser";

export class TsClassImplementsListParser extends TsParserBase {

    public static readImplementsList(parent: ITsParser): ITsType[] {
        const parser = new TsClassImplementsListParser(parent);
        try {
            console.group('Read class implements list');
            return parser.readImplementsList();
        } finally {
            console.groupEnd();
        }
    }

    private readImplementsList(): ITsType[] {
        const result: ITsType[] = [];
        while(true) {
            const entity = this.readEntity();
            if (entity === null) break;
            if (entity instanceof TsType) result.push(entity);
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): ITsEntity {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                return TsTypeParser.readType(this);
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                break;
            default:
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}