import { ETsEntitySymbolTypes, ETsEntityTypes, ITsParser, TAttributes, TReadEntityResult } from '../../../ts-readers/model';
import { TsDecorator } from '../../../ts-decorator';
import { TsVariable } from '../../../ts-variable';
import { TsMethod } from './ts-method';
import { TsParserBase } from '../../../ts-readers/ts-parser-base';
import { TsClassProperty } from './ts-class-property';
import { TsType } from '../../ts-type';
import { ITsEntity } from '~/openapi/ts-parser/model';

export class TsClassParser extends TsParserBase {

    constructor(
        body: string,
        parent?: ITsParser,
    ) {
        super(body, parent);
    }

    private entityName: string;

    protected analyseEntity(entity: string, entityType): TReadEntityResult {
        const entityResult = super.analyseEntity(entity, entityType);
        if (entityResult) return entityResult;

        switch(entityType) {
            case ETsEntitySymbolTypes.Private:
            case ETsEntitySymbolTypes.Protected:
            case ETsEntitySymbolTypes.Public:
                this.attributes.accessModifier = entityType;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Readonly:
                this.attributes.isReadonly = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Static:
                this.attributes.isStatic = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Async:
                this.attributes.isAsync = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Variable:
                return new TsVariable(this, this.attributes.isExport, entity as "const" | "let" | "var");
            case ETsEntitySymbolTypes.Optional:
                this.attributes.isOptional = true;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.EntityName:
                this.entityName = entity;
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.ArgumentStart:
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
            case ETsEntitySymbolTypes.TypeDefinition:
            case ETsEntitySymbolTypes.Assignment:
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
                this.index += entity.length;
                break;
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        if (entity === 'get') return ETsEntitySymbolTypes.Get;
        if (entity === 'set') return ETsEntitySymbolTypes.Set;
        if (entity === 'public') return ETsEntitySymbolTypes.Public;
        if (entity === 'private') return ETsEntitySymbolTypes.Private;
        if (entity === 'protected') return ETsEntitySymbolTypes.Protected;
        if (entity === 'static') return ETsEntitySymbolTypes.Static;
        if (entity === 'readonly') return ETsEntitySymbolTypes.Readonly;
        if (entity.match(/^\w+$/)) return ETsEntitySymbolTypes.EntityName;
        if (entity === '?') return ETsEntitySymbolTypes.Optional;
    }

    private readMethodDefinition(name: string, accessModifier: ETsEntityTypes, isStatic: boolean, isAbstract: boolean, decorators?: TsDecorator[]): ITsEntity | undefined {
        // it could be return type definition, we have to check is that contain ':' sign
        let returnType: TsType | undefined;
        let body: string | undefined;

        const parameters = this.readParameters();

        if (this.nextIs(':', true)) {
            returnType = this.readTypeDeclaration();
        }
        if (!isAbstract) {
            body = this.readMethodBody();
        }

        console.log('Method parts', parameters, returnType, body);
        return new TsMethod(
            name,
            accessModifier,
            isStatic,
            isAbstract,
            parameters,
            returnType,
            body,
            decorators
        );
    }

    private readParameters(): string {
        const params = this.readToBalanced(')');
        if (!params) return '';
        return this.restoreCode(params);
    }

    protected extractParameters(): { decorators?: TsDecorator[], attributes: TAttributes, entityName: string } {
        const params = super.extractParameters();
        const { entityName } = this;
        this.entityName = '';
        return { ...params, entityName };
    }

    private readTypeDeclaration(): TsType {
        return new TsType(this);
    }

    private readMethodBody(): string {
        return this.readToBalanced('}');
    }

    private readPropertyDefinition(
        propertyName: string,
        accessModifier: ETsEntityTypes,
        isStatic: boolean,
        isAbstract: boolean,
        isReadonly: boolean,
        isOptional: boolean,
        decorators?: TsDecorator[]
    ): ITsEntity | undefined {
        return new TsClassProperty(this, propertyName, accessModifier, isStatic, isAbstract, isReadonly, isOptional, decorators);
    }
}