import { ETsEntityTypes, ITsReader, TAttributes, TsEntity } from '../../../ts-readers/model';
import { TsDecorator } from '../../../ts-decorator';
import { TsVariable } from '../../../ts-variable';
import { TsMethod } from './ts-method';
import { TsParserBase } from '../../../ts-readers/ts-parser-base';
import { TsClassProperty } from './ts-class-property';

export class TsClassParser extends TsParserBase {

    constructor(
        body: string,
        parent?: ITsReader,
    ) {
        super(body, parent);
    }

    private entityName: string;

    protected analyseEntity(entity: string, entityType): TsEntity | ETsEntityTypes | undefined {
        const entityResult = super.analyseEntity(entity, entityType);
        if (entityResult) return entityResult;

        switch(entityType) {
            case ETsEntityTypes.Private:
            case ETsEntityTypes.Protected:
            case ETsEntityTypes.Public:
                this.attributes.accessModifier = entityType;
                this.index += entity.length;
                break;
            case ETsEntityTypes.Readonly:
                this.attributes.isReadonly = true;
                this.index += entity.length;
                break;
            case ETsEntityTypes.Static:
                this.attributes.isStatic = true;
                this.index += entity.length;
                break;
            case ETsEntityTypes.Async:
                this.attributes.isAsync = true;
                this.index += entity.length;
                break;
            case ETsEntityTypes.Variable:
                return new TsVariable(this, this.attributes.isExport, entity as "const" | "let" | "var");
            case ETsEntityTypes.Optional:
                this.attributes.isOptional = true;
                this.index += entity.length;
                break;
            case ETsEntityTypes.EntityName:
                this.entityName = entity;
                this.index += entity.length;
                break;
            case ETsEntityTypes.Argument:
                {
                    const { decorators, attributes, entityName } = this.extractParameters();
                    return this.readMethodDefinition(
                        entityName,
                        attributes.accessModifier,
                        !!attributes.isStatic,
                        !!attributes.isAbstract,
                        decorators,
                    );
                }
            case ETsEntityTypes.TypeDefinition:
            case ETsEntityTypes.Assignment:
                    {
                    const { decorators, attributes, entityName } = this.extractParameters();
                    this.index += entity.length;
                    return this.readPropertyDefinition(
                        entityName,
                        attributes.accessModifier,
                        !!attributes.isStatic,
                        !!attributes.isAbstract,
                        !!attributes.isReadonly,
                        !!attributes.isOptional,
                        decorators
                    );
                }
            default:
                // console.log('Unknown entity:', entity, entityType);
                this.index += entity.length;
                break;
        }
    }

    protected defineEntityType(entity: string): ETsEntityTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        if (entity === 'get') return ETsEntityTypes.Get;
        if (entity === 'set') return ETsEntityTypes.Set;
        if (entity === 'public') return ETsEntityTypes.Public;
        if (entity === 'private') return ETsEntityTypes.Private;
        if (entity === 'protected') return ETsEntityTypes.Protected;
        if (entity === 'static') return ETsEntityTypes.Static;
        if (entity === 'readonly') return ETsEntityTypes.Readonly;
        if (entity.match(/^\w+$/)) return ETsEntityTypes.EntityName;
        if (entity === '?') return ETsEntityTypes.Optional;
    }

    private readMethodDefinition(name: string, accessModifier: ETsEntityTypes, isStatic: boolean, isAbstract: boolean, decorators?: TsDecorator[]): TsEntity | undefined {
        const methodSignature = this.expectOf('{', true);
        if (!methodSignature) return;

        const methodBody = this.readToBalanced('}');
        if (!methodBody) return;

        const pMethodSignature = this.restoreCode(methodSignature);
        const pMethodBody = this.restoreCode(methodBody);
        return new TsMethod(
            name,
            accessModifier,
            isStatic,
            isAbstract,
            pMethodSignature,
            pMethodBody,
            decorators
        );
    }

    protected extractParameters(): { decorators?: TsDecorator[], attributes: TAttributes, entityName: string } {
        const params = super.extractParameters();
        const { entityName } = this;
        this.entityName = '';
        return { ...params, entityName };
    }


    private readPropertyDefinition(
        propertyName: string,
        accessModifier: ETsEntityTypes,
        isStatic: boolean,
        isAbstract: boolean,
        isReadonly: boolean,
        isOptional: boolean,
        decorators?: TsDecorator[]
    ): TsEntity | undefined {
        return new TsClassProperty(this, propertyName, accessModifier, isStatic, isAbstract, isReadonly, isOptional, decorators);
    }
}