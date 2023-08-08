import { CommonOADefinition } from './common-oa-definition';
import { IOAModule, IOpenApiGather, IOpenApiSerializable } from './model';

export class OAModule implements IOpenApiSerializable, IOAModule {

    constructor(private readonly tag: CommonOADefinition) { }

    getDefaultResponse(statusCode: number): string {
        return '#components/schemas/' + (this.tag.properties.responses?.[statusCode]?.type ?? 'IError');
    }

    toOpenApi(gatherer: IOpenApiGather): { [key: string]: string | number | object; } {
        const { version, info, security: securitySchemes } = this.tag.properties;
        const securityKeys = Object.keys(securitySchemes);
        const security = securityKeys.reduce((acc, k) => ({
            ...acc,
            [k]: []
        }), {});
        return {
            ...(version as object),
            info,
            components: {
                securitySchemes,
                security,
                schemas: {
                }
            }
        }
    }
}