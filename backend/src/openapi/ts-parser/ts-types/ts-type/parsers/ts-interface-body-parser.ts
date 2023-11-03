import { ITsEntity, TsTypeOwner } from "../../../model";
import { ETsEntitySymbolTypes, ETsEntityTypes, ITsParser } from "../../../ts-readers/model";
import { ITsType } from "../../model";
import { TsProperty } from "../../ts-property";
import { TsAddtitionalInterfacePropertyParser } from "./ts-additional-interface-property-parser";
import { TsInterfaceMethod } from "../../ts-type-definitions/ts-interface-definition/ts-interface-method";
import { TsInterfaceProperty } from "../../ts-type-definitions/ts-interface-definition/ts-interface-property";
import { TsInterfacePropertyParser } from "./ts-interface-property-parser";
import { TsInterfaceMethodParser } from "./ts-interface-method-parser";
import { OADefinition } from "~/openapi/components/model";
import { TsBaseCommentParser } from "~/openapi/ts-parser/ts-readers/ts-base-comment-parser";
import { TsTypeService } from "~/openapi/services/ts-type.service";

export class TsInterfaceBodyParser extends TsBaseCommentParser {

    public static readInterfaceImplementation(parent: ITsParser, owner: TsTypeOwner, receiver: ITsType): ITsType {
        const parser = new TsInterfaceBodyParser(parent, owner);
        try {
            console.group('Read interface implementation:');
            return parser.readInterfaceImplementation(receiver);
        } finally {
            console.groupEnd();
        }
    }

    private constructor (parent: ITsParser, private owner: TsTypeOwner) {
        super(parent);
    }

    private readInterfaceImplementation(receiver?: ITsType): ITsType {
        const result: ITsType = receiver ?? TsTypeService.createEmptyType();
        const properties: TsInterfaceProperty[] = [];
        const methods: TsInterfaceMethod[] = [];
        let latestOADefinition;
        while (true) {
            this.lock();
            const entity = this.readEntity();
            if (entity === null) break;
            if (entity instanceof OADefinition) {
                latestOADefinition = entity;
                continue;
            }

            switch(entity.entityType) {
                case ETsEntityTypes.Property: {
                    const property = entity as TsInterfaceProperty;
                    if (latestOADefinition) {
                        property.setDefinition(latestOADefinition);
                    }
                    properties.push(property);
                    break;
                }
                case ETsEntityTypes.Method:
                    const method = entity as TsInterfaceMethod;
                    if (latestOADefinition) {
                        method.setDefinition(latestOADefinition);
                    }
                    methods.push(method);
                    break;
            }
            latestOADefinition = undefined;
        }
        result.populateMethods(methods)
        result.populateProperties(properties);
        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): ITsEntity {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        // console.log('Read interface body (entity):', entity, entityType, this.current.substring(0, 20));
        switch(entityType) {
            case ETsEntitySymbolTypes.ArgumentStart:
            {
                this.unlock();
                return this.readMethodDefinition();
            }
            case ETsEntitySymbolTypes.TypeDefinition:
            {
                this.unlock();
                return this.readPropertyDefinition();
            }
            case ETsEntitySymbolTypes.Semicolon:
                this.unlock();
                this.index += entity.length;
                this.lock();
                break;
            case ETsEntitySymbolTypes.OpenSquareBracket:
                // could be additional property begins
                return this.readAdditionalPropertyDefinition();
            case ETsEntitySymbolTypes.CloseBrace:
                this.index += entity.length;
                return null;
            default:
                this.index += entity.length;
                return;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        const entityType = super.defineEntityType(entity);
        if (entityType) return entityType;
        if (entity === 'set') return ETsEntitySymbolTypes.Set;
        if (entity === 'get') return ETsEntitySymbolTypes.Get;
        if (entity === ';') return ETsEntitySymbolTypes.Semicolon;
        if (this.isEntityName(entity)) return ETsEntitySymbolTypes.EntityName;
    }

    private readMethodDefinition(): TsInterfaceMethod {
        return TsInterfaceMethodParser.readMethod(this, this.owner);
    }

    private readPropertyDefinition(): TsProperty {
        return TsInterfacePropertyParser.readProperty(this, this.owner) as TsProperty;
    }

    private readAdditionalPropertyDefinition(): ITsEntity | undefined {
        const property = TsAddtitionalInterfacePropertyParser.readAdditionalInterfaceProperty(this);
        return property;
    }

}