import { ITsEntity } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser, TPropertyModifiers } from "~/openapi/ts-parser/ts-readers/model";
import { TsClassMethod } from "../ts-class-method";
import { TsClass } from "../ts-class-definition";
import { TsParametersParser } from "~/openapi/ts-parser/ts-functions/ts-parameter";
import { TsTypeParser } from "../../../ts-type/parsers/ts-type-parser";
import { TsCodeBlockParser } from "~/openapi/ts-parser/ts-code-block/ts-code-block-parser";

class TsClasMethodIml extends TsClassMethod {
    constructor(
        owner: TsClass,
        modifiers: TPropertyModifiers
    ) {
        super(owner, '');
        this.isAbstract = modifiers.isAbstract ?? false;
        this.isStatic = modifiers.isStatic ?? false;
        this.accessModifier = modifiers.accessModifier;
        this.isGetter = modifiers.isGetter ?? false;
        this.isSetter = modifiers.isSetter ?? false;
        this.isAsync = modifiers.isAsync ?? false;
    }
}

export class TsClassMethodParser extends TsParserBase {

    public static readClassMethod(
        parent: ITsParser,
        owner: TsClass,
    ): TsClassMethod {
        try {
            console.group('Read Class Method Start');
            const parser = new TsClassMethodParser(parent);
            return parser.readClassMethod(owner);
        } finally {
            console.groupEnd();
        }
    }

    private readClassMethod(
        owner: TsClass,
    ): TsClassMethod {
        const modifiers = this.parent.extractModifiers();
        const result = new TsClasMethodIml(owner, modifiers);
        this.readEntity(result);
        return result;
    }

    protected analyseEntity(
        entity: string,
        entityType: ETsEntitySymbolTypes,
        method: TsClasMethodIml,
    ): ITsEntity {
        const result = super.analyseEntity(entity, entityType, method);
        if (result) return result;

        // console.log('Read class method entity', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                method.name = entity;
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
                this.index += entity.length;
                const parameters = TsParametersParser.readParameters(this);
                method.parameters = parameters;
                break;
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                method.returnType = TsTypeParser.readType(this);
                break;
            case ETsEntitySymbolTypes.ArgumentEnd:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.OpenBrace:
                const methodBody = TsCodeBlockParser.readCodeBlock(this);;
                method.body = methodBody;
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}