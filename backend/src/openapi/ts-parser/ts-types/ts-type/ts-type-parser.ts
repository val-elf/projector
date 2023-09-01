import { TsParserBase } from '../../ts-readers/ts-parser-base';
import { ETsEntitySymbolTypes, ETsEntityTypes, TReadEntityResult } from '../../ts-readers/model';
import { ITsEntity, TsEntity } from '../../model';
import { TsType } from '..';
import { TsMethod } from '../ts-type-definitions/ts-class-definition/ts-method';
import { TsDecorator } from '../../ts-decorator';
import { TsInterfaceProperty } from '../ts-type-definitions/ts-interface-definition/ts-interface-property';
import { TsAddtitionalInterfaceProperty } from '../ts-type-definitions/ts-interface-definition/ts-additional-interface-property';
import e from 'express';

export interface ITsTypeParserResults {
    entityName: string;
    genericsList?: TsType[];
    unionsList?: TsType[];
}

enum ETsTypeReadMode {
    Undefined = 'undefined',
    InterfaceReading = 'interface-reading',
}

export class TsTypeParser extends TsParserBase {

    private currentEntityName?: string;
    private unionsList: TsType[] = [];
    private genericsList: TsType[] = [];
    private propertiesList: TsInterfaceProperty[] = [];
    private readMode = ETsTypeReadMode.Undefined;

    public readTypeDeclaration(): TsType | TsType[] | undefined {
        const result: TsType[] = [];
        console.log('Trying to read type declaration', this.current.substring(0, 100)+'...');
        while(true) {
            const entity = this.readEntity();
            console.log('Type reading Entity', entity);
            if (!entity) break;

            result.push(entity as TsType);
        }
        return result.length === 1 ? result[0] : result.length > 1 ? result : undefined;
    }

    protected analyseEntity(entity: string, entityType: any): TReadEntityResult {
        const readEntity = super.analyseEntity(entity, entityType);
        if (readEntity) {
            return readEntity;
        }
        switch(entityType) {
            /*case ETsEntitySymbolTypes.TypeDefinition:
                this.index += entity.length;
                break;*/

            case ETsEntitySymbolTypes.GenericOpen:
                this.genericsList = this.readGenerics();
                break;

            case ETsEntitySymbolTypes.OpenBrace:
                // interface type reading
                this.index += entity.length;
                return this.readInterfaceDefinition();

            case ETsEntitySymbolTypes.CloseBrace:
                this.index += entity.length;
                return;

            case ETsEntitySymbolTypes.Union:
                this.index += entity.length;
                const { currentEntityName, genericsList, unionsList } = this.extractParameters();
                this.unionsList = [...unionsList, new TsType(currentEntityName, genericsList)];
                break;

            case ETsEntitySymbolTypes.EntityName:
                this.index += entity.length;
                this.currentEntityName = entity;
                return new TsEntity(entity, ETsEntityTypes.EntityName);

            case ETsEntitySymbolTypes.Readonly:
                this.attributes.isReadonly = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Optional:
                this.attributes.isOptional = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
            {
                // this.currentEntityType = ETsEntityTypes.Method;
                const { decorators, attributes, entityName } = this.extractParameters();
                return this.readMethodDefinition(
                    entityName,
                    attributes.accessModifier,
                    !!attributes.isStatic,
                    !!attributes.isAbstract,
                    decorators,
                );
            }

            case ETsEntitySymbolTypes.OpenSquareBracket:
                // could be additional property begins
                const { decorators } = this.extractParameters();
                return this.readAdditionalPropertyDefinition(decorators);

            case ETsEntitySymbolTypes.TypeDefinition:
            case ETsEntitySymbolTypes.Assignment:
            {
                console.log('Getting type definition', entity, entityType);
                const { decorators, attributes, currentEntityName } = this.extractParameters();
                this.index += entity.length;
                return this.readPropertyDefinition(
                    currentEntityName,
                    !!attributes.isReadonly,
                    !!attributes.isOptional,
                    decorators
                );
            }
            default:
                if (entity !== '}' && entity !== '{') {
                    console.log('Unknown entity:', entity, entityType);
                }

                this.index += entity.length;
                break;

        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes {
        console.log('--------------:', entity);
        let entityType = super.defineEntityType(entity);
        if (entityType) {
            return entityType;
        }
        if (entity === 'get') return ETsEntitySymbolTypes.Get;
        if (entity === 'set') return ETsEntitySymbolTypes.Set;
        if (entity === 'readonly') return ETsEntitySymbolTypes.Readonly;
        if (entity.match(/^\w+$/)) return ETsEntitySymbolTypes.EntityName;
        if (entity === '?') return ETsEntitySymbolTypes.Optional;

        if (entity === '<') return ETsEntitySymbolTypes.GenericOpen;
        if (entity === '>') return ETsEntitySymbolTypes.GenericClose;
        if (entity === '{') return ETsEntitySymbolTypes.OpenBrace;
        if (entity === '}') return ETsEntitySymbolTypes.CloseBrace;
        if (entity === '|') return ETsEntitySymbolTypes.Union;
        if (entity === '&') return ETsEntitySymbolTypes.Intersection;
        if (entity === ',') return ETsEntitySymbolTypes.Comma;
        if (entity === ':') return ETsEntitySymbolTypes.TypeDefinition;
        return ETsEntitySymbolTypes.EntityName;
    }

    protected extractParameters(): { currentEntityName: string, genericsList: TsType[], unionsList: TsType[], [key: string]: any } {
        const params = super.extractParameters();
        const { currentEntityName, genericsList, unionsList } = this;
        this.currentEntityName = undefined;
        this.genericsList = [];
        this.unionsList = [];
        return { ...params, currentEntityName, genericsList, unionsList };
    }

    private readGenerics(): TsType[] {
        const gens = this.restoreCode(this.readToBalanced('>', true));
        const res: TsType[] = [];

        while(true) {
            const entity = this.readEntity();
            if (!entity) break;
            if (entity instanceof TsType) {
                if (entity.entityType === ETsEntityTypes.Generic) {
                    res.push(entity);
                }
            }
        }

        return res;
    }

    private readInterfaceDefinition(): (TsInterfaceProperty | TsMethod)[] {
        const properties: TsInterfaceProperty[] = [];
        const methods: TsMethod[] = [];
        console.log('REading interface properties:', this.current.substring(0, 100)+'...');
        while(true) {
            const entity = this.readEntity();
            console.log('REad entity', entity);
            if (!entity) break;
            if (entity instanceof TsEntity) {
                switch(entity.entityType) {
                    case ETsEntityTypes.Property:
                        console.log('Add property', entity);
                        properties.push(entity as TsInterfaceProperty);
                        break;
                }
            }
        }
        console.log('Read interface definition', properties, methods);
        return [...properties, ...methods];
    }

    private readMethodDefinition(
        name: string,
        accessModifier: ETsEntityTypes,
        isStatic: boolean,
        isAbstract: boolean,
        decorators?: TsDecorator[]
    ): ITsEntity | undefined {
        const params = this.restoreCode(this.readToBalanced(')', true));
        let returnType = TsType.Any;
        if (this.nextIs(':', true)) {
            returnType = new TsType(this);
        }

        return new TsMethod(
            name,
            accessModifier,
            isStatic,
            isAbstract,
            params,
            returnType,
            undefined,
            decorators
        );
    }

    private readPropertyDefinition(
        propertyName: string,
        isReadonly: boolean,
        isOptional: boolean,
        decorators?: TsDecorator[]
    ): ITsEntity | undefined {
        return new TsInterfaceProperty(this, propertyName, isReadonly, isOptional, decorators);
    }

    private readAdditionalPropertyDefinition(decorators: TsDecorator[]): ITsEntity | undefined {
        return new TsAddtitionalInterfaceProperty(this, decorators);
    }

}