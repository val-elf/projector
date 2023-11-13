import { ITsDecorator, ITsEntity } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { TsEnumDefinition } from "../ts-enum-definition";
import { TsEnumPropertiesParser } from "./ts-enum-property-parser";

class TsEnumDefinitionImpl extends TsEnumDefinition {
    constructor(
        isExport: boolean,
        decorators?: ITsDecorator[],
    ) {
        super('', isExport, decorators);
    }
}

export class TsEnumParser extends TsParserBase {
    public static readEnumDefinition(parent: ITsParser, isExport: boolean, decorators?: ITsDecorator[]): TsEnumDefinition {
        try {
            console.group('Reading enum definition');
            const parser = new TsEnumParser(parent);
            return parser.readEnumDefinition(isExport, decorators);
        } finally {
            console.groupEnd();
        }
    }

    private readEnumDefinition(isExport: boolean, decorators?: ITsDecorator[]): TsEnumDefinition {
        const result = new TsEnumDefinitionImpl(isExport, decorators);
        const container = { result };
        this.readEntity(container);
        return container.result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, container: { result: TsEnumDefinition}): ITsEntity {
        // console.log('Analyse entity in enum reader:', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.Enum:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                container.result.name = entity;
                break;
            case ETsEntitySymbolTypes.OpenBrace:
                const properties = TsEnumPropertiesParser.readEnumProperties(this);
                container.result.addProperties(properties);
                return null;
        }
        return;
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === 'enum') return ETsEntitySymbolTypes.Enum;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}