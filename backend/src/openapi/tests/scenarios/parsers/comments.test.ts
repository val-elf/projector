import { describe, it } from "node:test";
import { testFileLoad } from "../model";
import assert from "node:assert";
import { TsFileParser } from "~/openapi/ts-parser/ts-readers/ts-file-parser";



describe('Comments testing', () => {

    it('should read comments', async () => {
        const testFile = await testFileLoad('comments-tests/base-test.test.ts');
        const fileParser = TsFileParser.readFile(testFile, 'test.ts');
        assert(fileParser);
    });
});