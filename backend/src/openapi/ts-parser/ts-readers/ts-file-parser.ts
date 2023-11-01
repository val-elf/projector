import { TsImport } from '../ts-import';
import {
    ETsEntitySymbolTypes,
    TReadEntityResult,
} from './model';
import { TsClass } from '../ts-types/ts-type-definitions/ts-class-definition/ts-class-definition';
import { TsInterfaceParser } from '../ts-types/ts-type-definitions/ts-interface-definition/parsers/ts-interface-parser';
import { TsEnumParser } from '../ts-types/ts-type-definitions/ts-enum-definition/parsers/ts-enum-parser';
import { TsTypeDefinitionParser } from '../ts-types/ts-type-definitions/ts-type-definition/ts-type-definition-parser';
import { TsVariableParser } from '../ts-variable/ts-variable-parser';
import { TsBaseDecoratorParser } from './ts-base-decorator-parser';
import { EDeclarationType, IOADefinition, IOARoute, OADefinition } from '~/openapi/components/model';
import { OAModule, OASchema, OATag } from '~/openapi/components';
import { TsBaseTypeDefinition } from '../ts-types/ts-type-definitions/ts-base-type-definition';
import { ITsEntity } from '../model';
import { TsClassParser } from '../ts-types/ts-type-definitions/ts-class-definition/parsers/ts-class-parser';
import { TsDecorator } from '../ts-decorator';
import { TsExportParser } from '../ts-export/ts-export-parser';
import { TsFunctionParser } from '../ts-functions/ts-function/ts-function-parser';
import { TsFile } from '~/openapi/reader';

interface IFileParserResult {
    moduleDefinition: OAModule;
    tags: OATag[];
    schemas: OASchema[];
    items: ITsEntity[];
}

class TsFileImpl extends TsFile {
    constructor(fileName: string) {
        super(
            fileName,
            [],
            [],
            [],
            [],
        );
    }

    public populateFileData(
        tags: OATag[],
        schemas: OASchema[],
        routes: IOARoute[],
        items: ITsEntity[],
        moduleDefinition: OAModule,
    ) {
        this.tags.push(...tags);
        this.schemas.push(...schemas);
        this.routes.push(...routes);
        this.items.push(...items);
        this.moduleDefinition = moduleDefinition;
    }
}

// base parser for whole file
export class TsFileParser extends TsBaseDecoratorParser {

    public static readFile(content: string, fileName: string): TsFile {
        const parser = new TsFileParser(content, fileName);
        try {
            console.group(`\n--------------------------------- ANALYSE FILE '${fileName}' ---------------------------------`);
            return parser.readFile();
        } finally {
            console.groupEnd();
        }
    }

    constructor(content: string, private readonly fileName: string) {
        super(content);
    }

    private readFile(): TsFile {
        let latestOADefinition: IOADefinition;
        let moduleDefinition: OAModule;
        let tags: OATag[] = [];
        let schemas: OASchema[] = [];
        let routes: IOARoute[] = [];
        let items: ITsEntity[] = [];
        let decorator: TsDecorator | undefined;

        const result = new TsFileImpl(this.fileName);


        while(true) {
            console.log('>>>>>>>>>>> BEGIN READ NEXT FILE ELEMENT >>>>>>>>>>>>>');
            let entity = this.readEntity();
            console.log('>>>>>>>>>>> Entity(file parser):\n', entity, '\n>>>>>>>>>>>>>>>');
            if (!entity) break;
            if (entity instanceof OADefinition) {
                switch(entity.type) {
                    case EDeclarationType.Module:
                        moduleDefinition = entity as OAModule;
                        break;
                    case EDeclarationType.Schema: {
                        latestOADefinition = entity as OASchema;
                        schemas.push(entity as OASchema);
                        break;
                    }
                    case EDeclarationType.Tag:
                        tags.push(entity as OATag);
                        latestOADefinition = entity as OATag;
                        break;
                }
            } else {
                if (!(entity instanceof TsDecorator)) {
                    items.push(entity);
                }
                if (entity instanceof TsClass) {
                    const classRoutes = entity.getRoutes();
                    routes.push(...classRoutes);
                    if (decorator) {
                        entity.decorators.push(decorator);
                    }
                    if (latestOADefinition instanceof OATag) {
                        entity.tag = latestOADefinition;
                    }
                    latestOADefinition = undefined;
                } else if (entity instanceof TsBaseTypeDefinition) {
                    if (latestOADefinition) {
                        const schemaElement = latestOADefinition as OASchema;
                        entity.applySchema(schemaElement);
                        latestOADefinition = undefined;
                    }
                } else if (entity instanceof TsDecorator) {
                    decorator = entity;
                } else {
                    decorator = undefined;
                    latestOADefinition = undefined;
                }
            }
        }

        result.populateFileData(
            tags,
            schemas,
            routes,
            items,
            moduleDefinition,
        );

        return result;
    }

    protected analyseEntity(entity: string, entityType: ETsEntitySymbolTypes): TReadEntityResult {
        const result = super.analyseEntity(entity, entityType);
        if (result) return result;

        // console.log('File parser analyse entity (Result)', entity, entityType);
        switch (entityType) {
            case ETsEntitySymbolTypes.Class: {
                const { decorators, modifiers: { isAbstract} } = this.extractParameters();
                return TsClassParser.readClassDefinition(this, false, isAbstract, decorators);
            }
            case ETsEntitySymbolTypes.Interface: {
                const definition = TsInterfaceParser.readInterfaceDefinition(this, false);
                return definition;
            }
            case ETsEntitySymbolTypes.Enum: {
                const { modifiers: { isExport } } = this.extractParameters();
                return TsEnumParser.readEnumDefinition(this, isExport);
            }
            case ETsEntitySymbolTypes.Type: {
                const typeDefinition = TsTypeDefinitionParser.readTypeDefinition(this, false);
                return typeDefinition;
            }
            case ETsEntitySymbolTypes.Variable: {
                const { modifiers: { isExport } } = this.extractParameters();
                const variable = TsVariableParser.readVariable(this, isExport);
                return variable;
            }
            case ETsEntitySymbolTypes.Async:
            case ETsEntitySymbolTypes.Function: {
                return TsFunctionParser.readFunction(this);
            }
            case ETsEntitySymbolTypes.Import:
                return new TsImport(this);
            case ETsEntitySymbolTypes.Semicolon:
                this.index += entity.length;
                break;
            case ETsEntitySymbolTypes.Export:
                return TsExportParser.readExportDefinition(this);
            default: {
                // this.index += entity.length;
                return;
            }
        }
    }

    protected defineEntityType(entity: string): ETsEntitySymbolTypes | undefined {
        const etype = super.defineEntityType(entity);
        if (etype) return etype;

        if (entity === 'const' || entity === 'let' || entity === 'var') return ETsEntitySymbolTypes.Variable;
        if (entity === 'class') return ETsEntitySymbolTypes.Class;
        if (entity === 'interface') return ETsEntitySymbolTypes.Interface;
        if (entity === 'enum') return ETsEntitySymbolTypes.Enum;
        if (entity === 'type') return ETsEntitySymbolTypes.Type;
        if (entity === 'function') return ETsEntitySymbolTypes.Function;
    }
}
