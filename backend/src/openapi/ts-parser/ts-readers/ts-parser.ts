import { TsParserBase } from './ts-parser-base';
import { TsImport } from '../ts-import';
import { TsVariable } from '../ts-variable';
import {
    ETsEntityTypes,
    TsEntity
} from './model';
import { TsClass } from '../ts-type/ts-type-definitions/ts-class-definition/ts-class-definition';
import { TsEnumDefinition, TsInterfaceDefinition, TsTypeDefinition } from '../ts-type/ts-type-definitions';


// base parser for whole file
export class TsParser extends TsParserBase {
    // attributes: TAttributes, decorators: TsDecorator[]
    protected analyseEntity(entity: string, entityType: ETsEntityTypes): TsEntity | ETsEntityTypes {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        switch (entityType) {
            case ETsEntityTypes.Class: {
                const { decorators, attributes: { isExport, isAbstract} } = this.extractParameters();
                return new TsClass(this, isExport, isAbstract, decorators);
            }
            case ETsEntityTypes.Interface: {
                const { decorators, attributes: { isExport } } = this.extractParameters();
                return new TsInterfaceDefinition(this, isExport, decorators);
            }
            case ETsEntityTypes.Enum: {
                const { decorators, attributes: { isExport } } = this.extractParameters();
                return new TsEnumDefinition(this, isExport, decorators);
            }
            case ETsEntityTypes.Type: {
                const { decorators, attributes: { isExport } } = this.extractParameters();
                return new TsTypeDefinition(this, isExport, decorators);
            }
            case ETsEntityTypes.Variable: {
                const { attributes: { isExport } } = this.extractParameters();
                return new TsVariable(this, isExport, entity as "const" | "let" | "var");
            }
            case ETsEntityTypes.Import:
                return new TsImport(this);
            case ETsEntityTypes.Export:
                this.attributes.isExport = true;
                this.index += entity.length;
                break;
            default: {
                this.index += entity.length;
                return new TsEntity(entity, entityType);
            }
        }
    }

    protected defineEntityType(entity: string): ETsEntityTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        if (entity === 'export') return ETsEntityTypes.Export;
        if (entity === 'class') return ETsEntityTypes.Class;
        if (entity === 'const' || entity === 'let' || entity === 'var')
            return ETsEntityTypes.Variable;
        if (entity === 'interface') return ETsEntityTypes.Interface;
        if (entity === 'enum') return ETsEntityTypes.Enum;
        if (entity === 'type') return ETsEntityTypes.Type;
    }
}
