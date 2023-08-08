
import { readFileSync} from 'fs';
import { glob } from 'glob';
import { analyseFile } from './parser';
import { OpenApi } from './components';

export interface IOpenApiOptions {
    apis: string[];
}

const paths = {};
const tags = [];

export const ParserContext: any = {

};

export async function prepareJSDoc(options: IOpenApiOptions) {
    // return FullText;

    const { apis } = options;
    const result = new OpenApi();
    result.tags = tags;
    result.paths = paths;

    result.components = {
        schemas: {},
    };

    for await (const api of apis) {
        const dir = (await glob(api)).sort();
        await Promise.all(dir.map(async file => {
            ParserContext.currentFileName = file;
            const content = readFileSync(file);
            try {
                analyseFile(result, content.toString(), file);
            } catch (err) {
                console.log('Error in file: ', file);
                console.error(err);
            }
        }));
    }

    return result.toOpenApi();
}
