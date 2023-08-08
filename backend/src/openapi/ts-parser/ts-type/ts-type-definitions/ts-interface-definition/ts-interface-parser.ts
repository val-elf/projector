import { TsDecorator } from '../../../ts-decorator';
import { TsProperty } from '../../ts-property';
import { TsMethod } from '../ts-class-definition/ts-method';
import { TsAddtitionalInterfaceProperty } from './ts-additional-interface-property';
import { TsInterfaceProperty } from './ts-interface-property';
import { ETsEntityTypes, TsEntity } from '../../../ts-readers/model';
import { TsParserBase } from '../../../ts-readers/ts-parser-base';

export class TsInterfaceParser extends TsParserBase {

    private entityName: string;

    constructor(code: string) {
        super(code);
    }


    protected analyseEntity(entity: string, entityType: any): ETsEntityTypes | TsEntity {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        switch(entityType) {
            case ETsEntityTypes.Readonly:
                this.attributes.isReadonly = true;
                this.index += entity.length;
                break;
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
            case ETsEntityTypes.OpenSquareBracket:
                // could be additiona property begins
                const { decorators } = this.extractParameters();
                return this.readAdditionalPropertyDefinition(decorators);
            case ETsEntityTypes.TypeDefinition:
            case ETsEntityTypes.Assignment:
                    {
                    const { decorators, attributes, entityName } = this.extractParameters();
                    this.index += entity.length;
                    return this.readPropertyDefinition(
                        entityName,
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

    protected defineEntityType(entity: string): ETsEntityTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        if (entity === 'get') return ETsEntityTypes.Get;
        if (entity === 'set') return ETsEntityTypes.Set;
        if (entity === 'readonly') return ETsEntityTypes.Readonly;
        if (entity.match(/^\w+$/)) return ETsEntityTypes.EntityName;
        if (entity === '?') return ETsEntityTypes.Optional;
    }

    protected extractParameters(): any {
        const { attributes, decorators } = super.extractParameters();
        this.attributes = {};
        this.decorators = [];
        const { entityName } = this;
        this.entityName = undefined
        return { attributes, decorators, entityName };
    }

    private readMethodDefinition(
        name: string,
        accessModifier: ETsEntityTypes,
        isStatic: boolean,
        isAbstract: boolean,
        decorators?: TsDecorator[]
    ): TsEntity | undefined {
        const methodSignature = this.expectOf(/[;\n\r]/, true);
        if (!methodSignature) return;

        const pMethodSignature = this.restoreCode(methodSignature);
        return new TsMethod(
            name,
            accessModifier,
            isStatic,
            isAbstract,
            pMethodSignature,
            undefined,
            decorators
        );
    }

    private readPropertyDefinition(
        propertyName: string,
        isReadonly: boolean,
        isOptional: boolean,
        decorators?: TsDecorator[]
    ): TsEntity | undefined {
        return new TsInterfaceProperty(this, propertyName, isReadonly, isOptional, decorators);
    }

    private readAdditionalPropertyDefinition(decorators: TsDecorator[]): TsEntity | undefined {
        return new TsAddtitionalInterfaceProperty(this, decorators);
    }


}