import { TsExpressionObjectAccess } from "../ts-parser/ts-functions/ts-expressions/ts-expression-object-access";
import { TsExpressionValue } from "../ts-parser/ts-functions/ts-expressions/ts-expression-value";
import { ETsEntityTypes } from "../ts-parser/ts-readers/model";
import { ITsMethod } from "../ts-parser/ts-types";
import { TsEnumDefinition } from "../ts-parser/ts-types/ts-type-definitions";
import { TsClass } from "../ts-parser/ts-types/ts-type-definitions/ts-class-definition";
import { TsEnumProperty } from "../ts-parser/ts-types/ts-type-definitions/ts-enum-definition/ts-enum-property";
import { CommonOADefinition } from "./common-oa-definition";
import { EDeclarationType, IOARoute, IPathSecurityDefinition, IPathsDefinition, IResponsesDefinition, OADefinition } from "./model";
import { OpenApiInstance } from "./openApi";

const PREPARE_PATH = (path: string) => path.replace(/:(\w+)/g, '{$1}').replace(/(^[\"\'\`]|[\"\'\`]$)/g, '');

interface ITagResponse {
    [key: number]: string;
}

export class OARoute extends OADefinition implements IOARoute {
    public type: EDeclarationType = EDeclarationType.Route;
    public entityType: ETsEntityTypes = ETsEntityTypes.OADefinition;
    public readonly name: string = 'route';
    private _method: ITsMethod;

    public readonly parameters?: object;
    public readonly description?: string;
    public readonly security?: object;
    public readonly responses?: object;
    public readonly requestBody?: { item: string };
    public readonly tags: string[];
    public readonly summary?: string;

    constructor(data: CommonOADefinition) {
        super(data);
        this.parameters = data.properties.parameters as object;
        this.description = data.properties.description as string;
        this.security = data.properties.security as object;
        this.responses = data.properties.responses as object;
        this.requestBody = data.properties.requestBody as { item: string };
        this.summary = data.properties.summary as string;
        this.tags = data.properties.tags as string[] ?? [];
    }

    public setEntityOwner(method: ITsMethod) {
        this._method = method;
    }

    public toOpenApi(): IPathsDefinition {
        const method = this._method;
        const { methodOwner } = method;
        const route = method.decorators.find(d => d.name === 'Route');

        const { argumentsList } = route;
        const methodParam = argumentsList.arguments[0];
        const path = PREPARE_PATH((argumentsList.arguments[1] as TsExpressionValue).expressionValue as string);

        let httpMethod: string;
        if (methodParam instanceof TsExpressionObjectAccess) {
            const { paramType } = methodParam;
            if (paramType instanceof TsEnumDefinition) {
                const property = methodParam.paramType.getProperty(methodParam.propertyName) as TsEnumProperty;
                httpMethod = property.value;
            } else {
                httpMethod = methodParam.propertyName.toLowerCase();
            }
        } else {
            httpMethod = methodParam?.name.split('.')[1].toLowerCase() ?? null;
        }

        const classTag = methodOwner instanceof TsClass && (methodOwner)?.tag ? methodOwner.tag : undefined;
        // console.log('Classtag is', this.methodOwner, classTag);
        const tagNames = [classTag ? classTag.name : this?.tags].flat();
        const { security, description, responses, summary } = this;

        const oaSecurity = this.prepareSecurity(security);
        const oaResponses = this.prepareResponses(responses as ITagResponse, oaSecurity);
        const oaRequests = this.prepareRequests();

        const parameters = this.prepareParameters(path);
        const paths: IPathsDefinition = {
            [path]: {
                [httpMethod]: {
                    tags: tagNames,
                    ...(oaSecurity ? { security: oaSecurity } : {}),
                    ...(oaRequests ? { requestBody: oaRequests } : {}),
                    ...(oaResponses ? { responses: oaResponses } : {}),
                    description,
                    summary,
                    operationId: method.name,
                    parameters,
                },
            }
        };

        return {
            ...paths
        }
    }

    private prepareParameters(path: string): any {
        const pathParametersNames = path.matchAll(/\{(\w+)\}/g);
        const inPath = [...pathParametersNames].map(p => p[1]);
        const paramOptions = this.parameters ?? {};
        return [
            ...inPath.map(p => {
                const poption = paramOptions[p];
                return {
                    in: 'path',
                    name: p,
                    description: poption ?? '',
                    schema: { type: 'string' },
                };
            }),
        ];
    }

    private prepareRequests(): any {
        const requestBody = this.requestBody;
        if (!requestBody) return;
        const { item } = requestBody;
        return {
            content: {
                'application/json': {
                    schema: { $ref: `#/components/schemas/${item}` },
                },
            }
        }

    }

    private prepareSecurity(security: any): any {
        if (!security) return;
        const securityKeys = Object.keys(security);
        return securityKeys.map(k => ({ [k]: security[k] }));
    }

    private prepareResponses(responses: ITagResponse = {}, oaSecurity: IPathSecurityDefinition[]): IResponsesDefinition {
        const { returnType } = this._method;
        const gatherer = OpenApiInstance;
        const responseKeys = Object.keys(responses);
        const fullDefinitions = {};
        const module = gatherer.module;
        Object.assign(fullDefinitions, {
            401: { description: 'Unauthorized', type: { $ref: module.getDefaultResponse(401) } },
            403: { description: 'Forbidden', type: { $ref: module.getDefaultResponse(403) } },
        });

        responseKeys.forEach(k => {
            if (!fullDefinitions[k]) {
                fullDefinitions[k] = {};
            }
            if (typeof responses[k] === "string") {
                fullDefinitions[k].description = responses[k];
                if (!fullDefinitions[k].type) {
                    fullDefinitions[k].type = { type: 'string' };
                }
            } else {
                fullDefinitions[k].description = responses[k].description ?? '';
                fullDefinitions[k].type = responses[k].type ?? { type: 'string' };
            }
        });

        if (oaSecurity && oaSecurity.length > 0) {
            if (!responseKeys.includes('401')) responseKeys.push('401');
            if (!responseKeys.includes('403')) responseKeys.push('403');
        }

        if (fullDefinitions['200']) {
            fullDefinitions['200'].type = returnType.toOpenApi();
        } else if (returnType) {
            responseKeys.push('200');
            fullDefinitions['200'] = {
                type: returnType.toOpenApi(),
            };
        }

        return responseKeys.reduce((acc, k) => ({
            ...acc,
            [k]: {
                description: fullDefinitions[k]?.description,
                content: {
                    'application/json': {
                        schema: fullDefinitions[k]?.type,
                    },
                }
            }
        }), {});
    }

}