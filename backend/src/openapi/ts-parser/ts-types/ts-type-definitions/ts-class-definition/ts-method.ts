import {
    IOpenApiGather,
    IOpenApiSerializable,
    IPathSecurityDefinition,
    IResponsesDefinition,
} from '../../../../components/model';
import { CommonOADefinition } from '../../../../components';
import { ETsEntityTypes } from '../../../ts-readers/model';
import { TsDecorator } from '../../../ts-decorator';
import { ITsTagged, TsEntity } from '../../../model';
import { ITsType, TsType } from '../..';


interface ITagResponse {
    [key: number]: string;
}

const PREPARE_PATH = (path: string) => path.replace(/:(\w+)/g, '{$1}').replace(/(^[\"\'\`]|[\"\'\`]$)/g, '');

export class TsMethod extends TsEntity implements IOpenApiSerializable {
    private oaMethodDefintion?: CommonOADefinition;

    public get methodDefinition(): CommonOADefinition | undefined {
        return this.oaMethodDefintion;
    }

    public set methodDefinition(value: CommonOADefinition | undefined) {
        this.oaMethodDefintion = value;
    }

    public readonly type = ETsEntityTypes.Method;

    public readonly methodParameters: string;

    constructor(
        public name: string,
        private accessModifier: ETsEntityTypes,
        private isStatic: boolean,
        private isAbstract: boolean,
        private parameters: string,
        public readonly returnType: TsType | undefined,
        private body: string | undefined,
        public readonly decorators?: TsDecorator[],
    ) {
        super(name, ETsEntityTypes.Method);
        this.methodParameters = parameters;
        this.parseMethodBody();
    }

    private prepareParameters(path: string): any {
        const pathParametersNames = path.matchAll(/\{(\w+)\}/g);
        const inPath = [...pathParametersNames].map(p => p[1]);
        const paramOptions = this.methodDefinition?.properties.parameters ?? {};
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

    private prepareSecurity(security: any): any {
        if (!security) return;
        const securityKeys = Object.keys(security);
        return securityKeys.map(k => ({ [k]: security[k] }));
    }

    private prepareResponses(responses: ITagResponse = {}, oaSecurity: IPathSecurityDefinition[], gatherer: IOpenApiGather): IResponsesDefinition {
        const responseKeys = Object.keys(responses);
        const fullDefinitions = {};
        const module = gatherer.getModule();
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
            fullDefinitions['200'].type = this.returnType.toOpenApi(gatherer);
        } else if (this.returnType) {
            console.log('Return type of method', this.name, this.returnType, this.returnType.toOpenApi(gatherer));
            responseKeys.push('200');
            fullDefinitions['200'] = {
                type: this.returnType.toOpenApi(gatherer),
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

    public toOpenApi(gatherer: IOpenApiGather) {
        if (!this.decorators || !this.hasDecorator('Route')) return {};
        const routes = this.decorators.filter(d => d.name === 'Route');
        const methods = routes.map(d => {
            const { parameters } = d;
            const methodParam = parameters[0];
            const path = PREPARE_PATH(parameters[1].name);
            const method = methodParam?.name.split('.')[1].toLowerCase() ?? null;
            return { method, path };
        }).filter(m => m);

        const classTag = (gatherer.currentContext as ITsTagged)?.tag ?? null;
        const { methodDefinition } = this;
        const methodTagProps = methodDefinition?.properties ?? {};
        const tagNames = [classTag ? classTag.name : methodDefinition?.properties.tags ?? ''].flat();
        const { security, description, responses } = methodTagProps;


        const oaSecurity = this.prepareSecurity(security);
        const oaResponses = this.prepareResponses(responses as ITagResponse, oaSecurity, gatherer);

        const paths = methods.reduce((acc, m) => {
            const { method, path } = m;
            if (!acc[path]) {
                acc[path] = {};
            }
            const parameters = this.prepareParameters(path);
            acc[path][method] = {
                tags: tagNames,
                ...(oaSecurity ? { security: oaSecurity } : {}),
                description,
                operationId: this.name,
                ...(oaResponses ? { responses: oaResponses } : {}),
                parameters,
            };
            return {
                ...acc,
            }
        }, {});

        return {
            ...paths
        }
    }

    public hasDecorator(name: string): boolean {
        return this.decorators?.some(d => d.name === name);
    }

    /*private static parseMethodSignature(signature: string): { methodParameters: string, returnType: string } {
        const match = signature.match(/^\s*\((.*)\)\s*(:\s*(.*))?\s*$/);
        const methodParameters = match?.[1] ?? '';
        const returnType = match?.[3] ?? '';
        return { methodParameters, returnType };
    }*/

    private parseMethodBody(): void {
    }
}
