import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { OpenApiInstance } from "~/openapi/components";
import { testFileLoad } from "../model";
import { TsFileParser } from "~/openapi/ts-parser/ts-readers/ts-file-parser";

describe('OpenApi Tests', () => {
    const contentPromise = testFileLoad('open-api-tests/open-api.test.ts')
    let content: string;

    beforeEach(async () => {
        content = await contentPromise;
    });

    it('check is open api created', () => {
        assert(OpenApiInstance);
        const tsFile = TsFileParser.readFile(content, 'test.ts');
        OpenApiInstance.addTsFile(tsFile);
        const interfaceItem = tsFile.items[0];
        assert(interfaceItem);
        const result = OpenApiInstance.toOpenApi();
        console.log('Result', JSON.stringify(result, null, 2));
    });
})