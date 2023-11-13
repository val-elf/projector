import { IOpenApiSerializable, IPathsDefinition, IOASchema, IOATag, IOAModule } from './model';
import { mergeDeep } from '../utils';
import { TsBaseTypeDefinition } from '../ts-parser/ts-types/ts-type-definitions/ts-base-type-definition';
import { TsFile } from '../reader';
import { TsClass } from '../ts-parser/ts-types/ts-type-definitions/ts-class-definition';
import { ITsType } from '../ts-parser/ts-types';

export class OpenApi implements IOpenApiSerializable {
    private dependencies: { [key: string]: ITsType[] } = {};
    public addDependency(name: string, dep: ITsType) {
        if (!this.dependencies[name]) {
            this.dependencies[name] = [];
        }
        this.dependencies[name].push(dep);
    }

    private get tags(): IOATag[] {
        return this.tsFiles.reduce((result, tsFile) => {
            return result.concat(tsFile.tags);
        }, []);
    }

    public get module(): IOAModule | undefined {
        return this.tsFiles.find(tsFile => tsFile.moduleDefinition)?.moduleDefinition;
    }

    private tsFiles: TsFile[] = [];

    protected getAllTypes(onlyExported = false): TsBaseTypeDefinition[] {
        return this.tsFiles.reduce((result, tsFile) => {
            const types = tsFile.types.filter(type => !onlyExported || type.isExport);
            return [...result, ...types];
        }, []);
    }

    private isClassRouter(tsclass: TsClass): boolean {
        return tsclass.decorators.some(decorator => decorator.name === 'Router');
    }

    public getAllClasses(onlyRouters = false): TsClass[] {
        return this.tsFiles.reduce((result, tsFile) => {
            const classes = tsFile.classes.filter(cls => !onlyRouters || this.isClassRouter(cls));
            return [...result, ...classes];
        }, []);
    }

    protected get allComponents(): Map<string, IOASchema> {
        return this.tsFiles.reduce((result, tsFile) => {
            tsFile.schemas.forEach(schema => {
                result.set(schema.name, schema);
            });
            return result;
        }, new Map<string, IOASchema>());
    }

    public addTsFile(tsFile: TsFile) {
        this.tsFiles.push(tsFile);
    }

    private mergePaths(paths: IPathsDefinition[]): IPathsDefinition {
        const result = {};
        paths.forEach(pathDef => {
            const paths = Object.keys(pathDef);
            paths.forEach(pathName => {
                const rpath = result[pathName] ?? {};
                const opath = pathDef[pathName];
                const methods = Object.keys(opath);
                methods.forEach(methodName => {
                    const method = opath[methodName];
                    rpath[methodName] = method;
                });
                result[pathName] = rpath;
            });
        });
        return result;
    }

    private outSchema(schemaName: string, output: { [key: string]: any }) {
        if (output[schemaName]) return;

        if (this.dependencies[schemaName]) {
            const deps = this.dependencies[schemaName];
            delete this.dependencies[schemaName];
            deps.filter(dep => !!dep.referencedTypeName).forEach(dep => this.outSchema(dep.referencedTypeName, output));
        }
        const schema = this.allComponents.get(schemaName);
        Object.assign(output, schema.toOpenApi());
    }

    private getAllSchemas(): { [key: string]: IOASchema } {
        const allComponents = this.allComponents;
        const allSchemaNames = [...allComponents.keys()];
        const result = allSchemaNames.reduce((result, schemaName) => {
            this.outSchema(schemaName, result);
            return result;
        }, {});
        return result;
    }

    toOpenApi() {
        const { tags } = this;
        const allSchemas = this.getAllSchemas();
        const cpaths = this.getAllClasses().map(cls => cls.toOpenApi());
        const paths = this.mergePaths([{}, ...cpaths]);
        const moduleBase = this.module?.toOpenApi() ?? {};

        return mergeDeep(moduleBase, {
            tags: tags.map(tag => tag.toOpenApi()),
            paths,
            components: {
                schemas: allSchemas,
            },
        });
    }
}

export const OpenApiInstance = new OpenApi();

