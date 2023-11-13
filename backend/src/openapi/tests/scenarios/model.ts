import { readFileSync } from "fs";
import { glob } from "glob";

export const testFileLoad = async (fileToLoad: string): Promise<string> => {
    const fileNames = await glob(`./src/openapi/tests/code-samples/${fileToLoad}`);
    const content = readFileSync(fileNames[0]).toString();
    return content;
}

export class BaseTest {

    protected static content: string;
    protected static fileToLoad: string;

    protected static async fileLoad(): Promise<void> {
        this.content = await testFileLoad(this.fileToLoad);
    }
}

