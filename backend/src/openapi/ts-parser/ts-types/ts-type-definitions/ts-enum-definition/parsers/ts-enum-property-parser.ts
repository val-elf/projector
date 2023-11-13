import { ITsEntity } from "~/openapi/ts-parser/model";
import { TsParserBase } from "~/openapi/ts-parser/ts-readers";
import { ETsEntitySymbolTypes } from "~/openapi/ts-parser/ts-readers/model";
import { TsEnumProperty } from "../ts-enum-property";
import { ITsProperty } from "../../../model";

class TsEnumPropertyImpl extends TsEnumProperty {
    constructor(
        name: string,
        value: string,
    ) {
        super(name, value);
    }
}

export class TsEnumPropertiesParser extends TsParserBase {

    public static readEnumProperties(parent: TsParserBase): ITsProperty[] {
        try {
            console.group('Reading enum properties');
            const parser = new TsEnumPropertiesParser(parent);
            return parser.readEnumProperties();
        } finally {
            console.groupEnd();
        }
    }

    private readEnumProperties(): ITsProperty[] {
        const result: ITsProperty[] = [];
        const container = { result };
        this.readEntity(container);
        // console.log('RESULT of reading enum properties:', container.result);
        return container.result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, container: { result: ITsProperty[], working?: ITsProperty }): ITsEntity {
        // console.log('Entity while reaing enum properties', entity, entityType, container);
        switch(entityType) {
            case ETsEntitySymbolTypes.Comma:
                this.index += entity.length;
                container.result.push(container.working);
                container.working = undefined;
                break;
            case ETsEntitySymbolTypes.EntityName:
                const property = new TsEnumPropertyImpl(entity, entity);
                container.working = property;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Assignment:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.String:
                const value = this.readCleanString();
                (container.working as TsEnumPropertyImpl).value = value;
                break;
            case ETsEntitySymbolTypes.Number:
                (container.working as TsEnumPropertyImpl).value = entity;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.OpenBrace:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.CloseBrace:
                this.index += entity.length;
                if (container.working) container.result.push(container.working);
                return null;
        }
        return;
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const result = super.defineEntityType(entity);
        if (result) return result;

        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (entity === '"') return ETsEntitySymbolTypes.String
        if (/^\d+$/.test(entity)) return ETsEntitySymbolTypes.Number;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }
}