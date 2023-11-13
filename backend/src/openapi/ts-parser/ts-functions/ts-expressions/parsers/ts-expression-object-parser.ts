import { ITsEntity, ITsExpression, TsEntity } from "../../../model";
import { TsParserBase } from "../../../ts-readers";
import { ETsEntitySymbolTypes, ETsEntityTypes, ITsParser } from "../../../ts-readers/model";
import { TsExpressionParser } from "./ts-expression-parser";
import { TsExpressionObject } from "../ts-expression-object";

class TsObjectField extends TsEntity {
    public readonly entityType = ETsEntityTypes.ObjectField;
    constructor(name, public readonly propertyValue: ITsExpression<unknown>) {
        super(name);
    }
}

export class TsExpressionObjectParser extends TsParserBase {

    public static readExpressionObject(parent: ITsParser): TsExpressionObject {
        try {
            console.group('Read Expression Object');
            const parser = new TsExpressionObjectParser(parent);
            return parser.readExpressionObject();
        } finally {
            console.groupEnd();
        }
    }

    protected readExpressionObject(): TsExpressionObject {
        const result = new TsExpressionObject();
        while(true) {
            const entity = this.readEntity();
            if (entity === null) break;
            if (entity instanceof TsObjectField) result.addField(entity.name, entity.propertyValue);
        }
        return result;
    }

    private fieldName: string;

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): ITsEntity {
        if (!entityType) return null;

        switch(entityType) {
            case ETsEntitySymbolTypes.OpenBrace:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.CloseBrace:
                this.index += entity.length;
                return null;
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                this.fieldName = entity;
                break;
            case ETsEntitySymbolTypes.Assignment:
                this.index += entity.length;
                const expression = TsExpressionParser.readExpression(this);
                return new TsObjectField(this.fieldName, expression);
                break;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        if (entity === '{') return ETsEntitySymbolTypes.OpenBrace;
        if (entity === '}') return ETsEntitySymbolTypes.CloseBrace;
        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (entity === ':') return ETsEntitySymbolTypes.Assignment;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}