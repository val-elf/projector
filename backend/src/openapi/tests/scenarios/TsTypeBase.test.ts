import { OpenApi } from '~/openapi/components';
import { TsTypeBase } from '~/openapi/ts-parser/ts-type/type-base';

export function typeBaseTest(openApi: OpenApi) {
    const typeBaseDeclaration = `
    {
        _owners_permissions: {
            [key: string]: IDbObjectPermission[];
        }
    }
    `;

    const typeBase = new TsTypeBase(typeBaseDeclaration);
    console.log(typeBase.toOpenApi(openApi));
}