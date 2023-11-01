import { ITsEntity } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { TsClassProperty } from "../ts-class-property";
import { TsClass } from "../ts-class-definition";
import { TsExpressionParser } from "~/openapi/ts-parser/ts-functions/ts-expressions/parsers/ts-expression-parser";
import { TsTypeParser } from "../../../ts-type/parsers/ts-type-parser";
import { ITsType } from "../../../model";

class TsClassPropertyImpl extends TsClassProperty{
    public propertyType: ITsType;

    constructor(owner: TsClass) {
        super(owner);
    }
}

export class TsClassPropertyParser extends TsParserBase {

    public static readClassProperty(parent: ITsParser, owner: TsClass): TsClassProperty {
        try {
            console.group('Read class property');
            const parser = new TsClassPropertyParser(parent);
            return parser.readClassProperty(owner);
        } finally {
            console.groupEnd();
        }
    }

    constructor(parent: ITsParser) {
        super(parent);
    }

    private readClassProperty(owner: TsClass): TsClassProperty {
        const result = new TsClassPropertyImpl(owner);
        this.readEntity(result, owner);
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, property: TsClassPropertyImpl, owner: TsClass): ITsEntity {
        const result = super.analyseEntity(entity, entityType, property);
        if (result) return result;

        // console.log('Reading class property entity:', entity, entityType);

        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                property.name = entity;
                break;
            case ETsEntitySymbolTypes.Optional:
                this.index += entity.length;
                property.isOptional = true;
                break;
            case ETsEntitySymbolTypes.Readonly:
                this.index += entity.length;
                property.isReadonly = true;
                break;
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                property.propertyType = TsTypeParser.readType(this, owner);
                break;
            case ETsEntitySymbolTypes.Assignment:
                this.index += entity.length;
                const propertyValue = TsExpressionParser.readExpression(this);
                property.value = propertyValue;
                break;
            default:



            return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;
        if (entity === '?') return ETsEntitySymbolTypes.Optional;

        if (this.isEntityName(entity, true)) return ETsEntitySymbolTypes.EntityName;
    }
}