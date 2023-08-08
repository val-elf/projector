import { OAModule } from './oa-module';
import { TsClass } from '../ts-parser/ts-type/ts-type-definitions/ts-class-definition/ts-class-definition';
import { IOpenApiGather, IOpenApiSerializable, IPathsDefinition, ISchema, ITag } from './model';
import { mergeDeep } from '../utils';
import { TsBaseTypeDefinition } from '../ts-parser/ts-type/ts-type-definitions/ts-base-type-definition';
import { TsEntity } from '../ts-parser/ts-readers/model';

export class OpenApi implements IOpenApiGather, IOpenApiSerializable {
    components: { schemas: { [key: string]: ISchema} } = {
        schemas: {},
    };
    paths: IPathsDefinition;
    classes: TsClass[] = [];
    types: TsBaseTypeDefinition[] = [];
    tags: ITag[];
    module?: OAModule;

    private context: TsEntity[] = [];

    findSchema(name: string): ISchema | null {
        // if (typeof name !== 'string') return null;
        const res = this.components.schemas[name];
        if (res?.entity instanceof TsBaseTypeDefinition) {
            res.entity.setCurrentGatherer(this);
        }
        return res;
    }

    typeExists(typeName: string): boolean {
        return this.types.some(type => type.name === typeName);
    }

    findType(name: string): TsBaseTypeDefinition | null {
        const res = this.types.find(type => type.name === name);
        res?.setCurrentGatherer(this);
        return res;
    }

    addClass(cls: TsClass) {
        this.classes.push(cls);
    }

    setModule(module: OAModule) {
        this.module = module;
    }

    getModule() {
        return this.module;
    }

    mergePaths(paths: IPathsDefinition[]): IPathsDefinition {
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

    set currentContext(value: TsEntity) {
        this.context.push(value);
    }

    get currentContext(): TsEntity {
        return this.context[this.context.length - 1];
    }

    releaseContext() {
        this.context.pop();
    }

    toOpenApi() {
        const { tags } = this;
        const allSchemas = Object.keys(this.components.schemas);
        const { paths: opaths } = this;
        const cpaths = this.classes.map(cls => cls.toOpenApi(this));
        const paths = this.mergePaths([opaths, ...cpaths]);
        const moduleBase = this.module?.toOpenApi(this) ?? {};

        return mergeDeep(moduleBase, {
            tags: tags.map(tag => tag.toOpenApi(this)),
            paths,
            components: {
                schemas: allSchemas.reduce((result, schemaName) => {
                    const schema = this.components.schemas[schemaName] as IOpenApiSerializable;
                    return Object.assign(result, schema.toOpenApi(this));
                }, {})
            }
        });
    }
}
