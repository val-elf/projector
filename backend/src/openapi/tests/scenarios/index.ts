import { OpenApi } from '~/openapi/components';
import { typeBaseTest } from './TsTypeBase.test';



export function test() {
    const openApi = new OpenApi();
    typeBaseTest(openApi);
}