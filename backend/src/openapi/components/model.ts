import { ITsEntity } from '../ts-parser/model';
import { ETsEntityTypes } from '../ts-parser/ts-readers/model';
import { ITsMethod } from '../ts-parser/ts-types';
import { TsBaseTypeDefinition } from '../ts-parser/ts-types/ts-type-definitions/ts-base-type-definition';
import { CommonOADefinition } from './common-oa-definition';

export enum EDeclarationType {
    Module = 'module',
    Schema = 'schema',
    Property = 'property',
    Route = 'route',
    Tag = 'tag',
}

export interface IOpenApiSerializable {
    toOpenApi(...args: any[]): any;
}

export interface IOAContainer<T extends IOADefinition> {
    definition?: T;
    setDefinition(definition: T): void;
}

export interface IOADefinition extends IOpenApiSerializable, ITsEntity {
    type: EDeclarationType;
}

export interface IOAModule extends IOADefinition{
    getDefaultResponse(code: number): string;
}

export interface IOASchema extends IOADefinition {
    name: string;
    description: string;
    entity: TsBaseTypeDefinition;
    toOpenApi(): { [key: string]: string | number | null | object };
}

export interface IOATag extends IOADefinition {
    name: string;
    description: string;
    summary?: string;
    externalDocs?: any;
}

export interface IOARoute extends IOADefinition {
    readonly parameters?: object;
    readonly description?: string;
    readonly security?: object;
    readonly responses?: object;
    readonly tags?: string[];
    setEntityOwner(method: ITsMethod): void;
    toOpenApi(): IPathsDefinition;
}

export interface IOAProperty extends IOADefinition {
    description: string;
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
    requestBody?: IRequestBodyDefinition;
    responses?: IResponsesDefinition;
    security?: ISecurityDefinition[];
}

export interface IPathsDefinition {
    [path: string]: {
        [method: string]: IPathDefinition
    }
}

export abstract class OADefinition implements IOADefinition {
    public abstract readonly name: string;
    public abstract readonly type: EDeclarationType;
    public abstract readonly entityType: ETsEntityTypes;

    constructor(
        protected readonly data: CommonOADefinition,
    ) {
    }

    public abstract toOpenApi(): any;
}