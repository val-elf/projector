export * from 'some-package1';
export * from 'some-package2';
export { item1 as Item1, item2 } from 'some-package3';

export const item4 = 'item4';

export interface IAttribute {
    name: string;
    value: string;
}

export type D = { a: 'b' };

function testFunctionName(param1, param2: string, param3: string[], param4: boolean, param5: { b: boolean }): string {
    return 'test';
}

