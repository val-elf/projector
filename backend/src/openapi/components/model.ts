import { ITsEntity } from '../ts-parser/model';
import { TsBaseTypeDefinition } from '../ts-parser/ts-types/ts-type-definitions/ts-base-type-definition';

export interface IOpenApiGather {
    components: {
        schemas: {
            [key: string]: ISchema;
        };
    };
    get currentContext(): ITsEntity;
    set currentContext(value: ITsEntity);
    findSchema(name: string): ISchema | null;
    findType(name: string): TsBaseTypeDefinition | null;
    typeExists(typeName: string): boolean;
    getModule(): IOAModule;
    releaseContext(): void;
}

export interface IOpenApiSerializable {
    toOpenApi(gatherer: IOpenApiGather): { [key: string]: string | number | null | object };
}

export interface IOAModule {
    getDefaultResponse(code: number): string;
}

export interface ISchema extends IOpenApiSerializable {
    name: string;
    description: string;
    entity: TsBaseTypeDefinition;
}

export interface ITag extends IOpenApiSerializable, ITagDefinition {
}

export interface IOpenApi {
    tags: any,
    paths: any,
    components: {
        schemas: {
            [key: string]: any;
        }
    }
}

export interface ITagDefinition {
    name: string;
    description: string;
    summary?: string;
    externalDocs?: any;
}

export interface IParametersDefinition {
    [key: string]: {
        name: string;
        in: string;
        description: string;
        required: boolean;
        schema: any;
    }
}

export interface IRequestBodyDefinition {
    [key: string]: {
        description: string;
        content: {
            [key: string]: {
                schema: TSchemaTypeDefinition;
            }
        }
    }
}

export type TSchemaTypeDefinition = {
    type: 'array';
    items: any;
} | {
    type: 'object';
    properties?: any;
} | {
    $ref: string;
} | {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'null';
};

export interface IResponsesDefinition {
    [key: string]: {
        description: string;
        content: {
            [key: string]: {
                schema: TSchemaTypeDefinition
            }
        }
    }
}

export interface IPathSecurityDefinition {
    [key: string]: string[]
}

export interface ISecurityDefinition {
    [key: string]: {
        type: string;
        description: string;
        name: string;
        in: string;
    }
}

export interface IPathDefinition {
    tags: string[];
    summary: string;
    description: string;
    operationId: string;
    parameters: IParametersDefinition[];
    requestBody: IRequestBodyDefinition;
    responses: IResponsesDefinition;
    security: ISecurityDefinition[];
}

export interface IPathsDefinition {
    [path: string]: {
        [method: string]: IPathDefinition
    }
}

