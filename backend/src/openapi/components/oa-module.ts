import { ETsEntityTypes } from '../ts-parser/ts-readers/model';
import { CommonOADefinition } from './common-oa-definition';
import { EDeclarationType, IOAModule, IOpenApiSerializable, OADefinition } from './model';

export class OAModule extends OADefinition implements IOpenApiSerializable, IOAModule {
    public readonly name: string = 'module';
    public readonly entityType: ETsEntityTypes = ETsEntityTypes.OADefinition;
    public readonly type: EDeclarationType = EDeclarationType.Module;

    constructor(data: CommonOADefinition) {
        super(data);
    }

    getDefaultResponse(statusCode: number): string {
        return '#/components/schemas/' + (this.data.properties.responses?.[statusCode]?.type ?? 'IError');
    }

    toOpenApi(): { [key: string]: string | number | object; } {
        const { version, info, security: securitySchemes } = this.data.properties;
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