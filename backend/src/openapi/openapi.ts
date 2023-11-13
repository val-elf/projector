
import { readFileSync} from 'fs';
import { glob } from 'glob';
import { TsFile } from './reader';
import { OpenApiInstance } from './components';
import { TsFileParser } from './ts-parser/ts-readers/ts-file-parser';

export interface IOpenApiOptions {
    apis: string[];
}

export async function prepareJSDoc(options: IOpenApiOptions) {
    // return FullText;

    const { apis } = options;
    const result = OpenApiInstance;

    for await (const api of apis) {
        const dir = (await glob(api)).sort();
        await Promise.all(dir.map(async file => {
            const content = readFileSync(file);
            try {
                const tsFile = TsFileParser.readFile(content.toString(), file);
                result.addTsFile(tsFile);
            } catch (err) {
                console.log('Error in file: ', file);
                console.error(err);
            }
        }));
    }

    return result.toOpenApi();
}
