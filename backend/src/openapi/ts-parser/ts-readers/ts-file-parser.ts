import { TsParserBase } from './ts-parser-base';
import { TsImport } from '../ts-import';
import { TsVariable } from '../ts-variable';
import {
    ETsEntitySymbolTypes,
    ETsEntityTypes,
    TReadEntityResult,
} from './model';
import { TsClass } from '../ts-types/ts-type-definitions/ts-class-definition/ts-class-definition';
import { TsEnumDefinition, TsInterfaceDefinition, TsTypeDefinition } from '../ts-types/ts-type-definitions';
import { TsEntity } from '../model';


// base parser for whole file
export class TsFileParser extends TsParserBase {
    // attributes: TAttributes, decorators: TsDecorator[]
    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): TReadEntityResult {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        switch (entityType) {
            case ETsEntitySymbolTypes.Class: {
                const { decorators, attributes: { isExport, isAbstract} } = this.extractParameters();
                return new TsClass(this, isExport, isAbstract, decorators);
            }
            case ETsEntitySymbolTypes.Interface: {
                const { decorators, attributes: { isExport } } = this.extractParameters();
                return new TsInterfaceDefinition(this, isExport, decorators);
            }
            case ETsEntitySymbolTypes.Enum: {
                const { decorators, attributes: { isExport } } = this.extractParameters();
                return new TsEnumDefinition(this, isExport, decorators);
            }
            case ETsEntitySymbolTypes.Type: {
                const { decorators, attributes: { isExport } } = this.extractParameters();
                return new TsTypeDefinition(this, isExport, decorators);
            }
            case ETsEntitySymbolTypes.Variable: {
                const { attributes: { isExport } } = this.extractParameters();
                return new TsVariable(this, isExport, entity as "const" | "let" | "var");
            }
            case ETsEntitySymbolTypes.Import:
                return new TsImport(this);
            case ETsEntitySymbolTypes.Export:
                this.attributes.isExport = true;
                this.index += entity.length;
                break;
            default: {
                this.index += entity.length;
                return new TsEntity(entity, ETsEntityTypes.Unknown);
            }
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        if (entity === 'export') return ETsEntitySymbolTypes.Export;
        if (entity === 'class') return ETsEntitySymbolTypes.Class;
        if (entity === 'const' || entity === 'let' || entity === 'var')
            return ETsEntitySymbolTypes.Variable;
        if (entity === 'interface') return ETsEntitySymbolTypes.Interface;
        if (entity === 'enum') return ETsEntitySymbolTypes.Enum;
        if (entity === 'type') return ETsEntitySymbolTypes.Type;
    }
}
