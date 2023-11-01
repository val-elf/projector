import { ITsEntity } from "~/openapi/ts-parser/model";
import { ETsEntitySymbolTypes, ITsParser } from "~/openapi/ts-parser/ts-readers/model";
import { TsClassProperty } from "../ts-class-property";
import { TsClassMethodParser } from "./ts-class-method-parser";
import { TsClass } from "../ts-class-definition";
import { TsClassBody } from "../ts-class-body";
import { TsClassMethod } from "../ts-class-method";
import { TsClassPropertyParser } from "./ts-class-property-parser";
import { TsBaseDecoratorParser } from "~/openapi/ts-parser/ts-readers/ts-base-decorator-parser";
import { TsDecorator } from "~/openapi/ts-parser/ts-decorator";
import { IOARoute, OADefinition } from "~/openapi/components/model";
import { OAProperty } from "~/openapi/components/oa-property";

const ITEM_LOCKER = Symbol('itemLocker');

class TsClassBodyIml extends TsClassBody {
    constructor(owner: TsClass) {
        super(owner);
    }

    addProperty(property: TsClassProperty) {
        this._properties.push(property);
    }

    addMethod(method: TsClassMethod) {
        this._methods.push(method);
    }
}

export class TsClassBodyParser extends TsBaseDecoratorParser {

    public static readClassBody(parent: ITsParser, owner: TsClass): TsClassBody {
        try {
            console.group('Read Class Body');
            const parser = new TsClassBodyParser(parent, owner);
            return parser.readClassBody();
        } finally {
            console.groupEnd();
        }
    }

    constructor(parent: ITsParser, private owner: TsClass) {
        super(parent);
    }

    private readClassBody(): TsClassBody {
        const result = new TsClassBodyIml(this.owner);
        let decorator: TsDecorator | undefined;
        let definition: OADefinition | undefined;
        while (true) {
            const entity = this.readEntity();
            if (entity === null) break;


            if (entity instanceof TsClassMethod) {
                if (decorator) {
                    entity.decorators.push(decorator);
                    decorator = undefined;
                }
                if (definition) {
                    entity.setDefinition(definition as unknown as IOARoute);
                    definition = undefined;
                }
                result.addMethod(entity);
            } else if (entity instanceof TsClassProperty) {
                if (decorator) {
                    entity.decorators.push(decorator);
                    decorator = undefined;
                }
                if (definition) {
                    entity.setDefinition(definition as OAProperty);
                    definition = undefined;
                }
                result.addProperty(entity);
            } else if (entity instanceof TsDecorator) {
                decorator = entity;
            } else if (entity instanceof OADefinition) {
                definition = entity;
            }
            else {
                decorator = undefined;
                definition = undefined;
            }
        }
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): ITsEntity {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        // console.log('Reading class body entity', entity, entityType);
        switch(entityType) {
            case ETsEntitySymbolTypes.Get:
            case ETsEntitySymbolTypes.Set:
                this.index += entity.length;
                this.modifiers.isGetter = entityType === ETsEntitySymbolTypes.Get;
                this.modifiers.isSetter = entityType === ETsEntitySymbolTypes.Set;
                break;

            case ETsEntitySymbolTypes.EntityName:
                this.lock(ITEM_LOCKER);
                this.index += entity.length;
                break;

            case ETsEntitySymbolTypes.ArgumentStart:
                this.unlock(ITEM_LOCKER);
                return TsClassMethodParser.readClassMethod(this, this.owner);

            case ETsEntitySymbolTypes.TypeDefinition:
            case ETsEntitySymbolTypes.Assignment:
                this.unlock(ITEM_LOCKER);
                return TsClassPropertyParser.readClassProperty(this, this.owner);

            case ETsEntitySymbolTypes.OpenBrace:
                this.index += entity.length;
                break;

            case ETsEntitySymbolTypes.Semicolon:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.CloseBrace:
                this.index += entity.length;
                return null;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;
        if (entity.match(/^\w+$/)) return ETsEntitySymbolTypes.EntityName;
    }
}