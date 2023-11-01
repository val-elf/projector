import { describe, it } from "node:test";
import { TsFileParser } from "~/openapi/ts-parser/ts-readers/ts-file-parser";
import { testFileLoad } from "../model";
import assert from "node:assert";

const getFileContent = async (fileName: string) => testFileLoad(`file-test/${fileName}`);
const getFileParserResult = (contentString: string) => TsFileParser.readFile(contentString, 'test.ts');

describe('File base parser tests', () => {
    it('should parse file', async () => {
        const content = await getFileContent('exports-tests.test.ts');
        const parserResult = getFileParserResult(content);
        console.log(parserResult);
        assert(parserResult);
    });
});