import { ITsEntity, TsTypeOwner } from "../../../model";
import { TsParametersParser } from "../../../ts-functions/ts-parameter";
import { TsParserBase } from "../../../ts-readers";
import { ETsEntitySymbolTypes, ITsParser } from "../../../ts-readers/model";
import { TsInterfaceMethod } from "../../ts-type-definitions/ts-interface-definition/ts-interface-method";
import { TsTypeParser } from "./ts-type-parser";

class TsInterfaceMethodImpl extends TsInterfaceMethod {
    constructor(owner: TsTypeOwner) {
        super('', owner);
    }
}

export class TsInterfaceMethodParser extends TsParserBase {

    public static readMethod(parent: ITsParser, owner: TsTypeOwner): TsInterfaceMethod {
        const parser = new TsInterfaceMethodParser(parent, owner);
        return parser.readMethodDefinition();
    }

    constructor(parent: ITsParser, private owner: TsTypeOwner) {
        super(parent);
    }

    private readMethodDefinition(): TsInterfaceMethod {
        const result = new TsInterfaceMethodImpl(this.owner);
        this.readEntity(result)
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes, method: TsInterfaceMethodImpl): ITsEntity {
        const entityResult = super.analyseEntity(entity, entityType, method);
        if (entityResult) return entityResult;

        switch(entityType) {
            case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                method.returnType = TsTypeParser.readType(this);
                return null;
            case ETsEntitySymbolTypes.EntityName:
                method.name = entity;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
                method.parameters = TsParametersParser.readParameters(this);
                break;
            case ETsEntitySymbolTypes.Semicolon:
                this.index += entity.length;
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const entityType = super.defineEntityType(entity);
        if (entityType) return entityType;

        if (this.isEntityName(entity)) {
            return ETsEntitySymbolTypes.EntityName;
        }
    }
}