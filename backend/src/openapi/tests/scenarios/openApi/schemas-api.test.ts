import { beforeEach, describe, it } from "node:test";
import { testFileLoad } from "../model";
import { TsFileParser } from "~/openapi/ts-parser/ts-readers/ts-file-parser";
import assert from "assert";
import { TsInterfaceDefinition } from "~/openapi/ts-parser/ts-types/ts-type-definitions";
import { OpenApiInstance } from "~/openapi/components";

describe('Test for schemas implementation and extensions', () => {
    const loader = testFileLoad('open-api-tests/schemas.test.ts')
    let content: string;

    beforeEach(async() => {
        content = await loader;
    })

    it('Check for schemas rendered', () => {
        const tsFile = TsFileParser.readFile(content, 'test.ts');
        OpenApiInstance.addTsFile(tsFile);
        const inputElement = tsFile.items.find(item => item.name === 'IInputElement') as TsInterfaceDefinition;
        assert(inputElement);
        // console.log('Properties of the IInputElement', inputElement, inputElement.properties);
        const result = OpenApiInstance.toOpenApi();
        console.log('Result is', JSON.stringify(result, null, 2));
    })
});