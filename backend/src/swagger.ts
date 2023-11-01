import { prepareJSDoc } from './openapi/openapi';

const options = {
/*
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Projector Backend",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                APIKeyHeader: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                },
            },
            security: {
                APIKeyHeader: [],
            },
        },
    },
*/
    apis: [
        './src/backend/core/models.ts', // models
        './src/backend/entities/models/**.ts', // models
        './src/server/**.ts', // paths
    ],
};
const consoleHoldings: any = {};
const noop = () => { };
export const setSilentMode = () => {
    consoleHoldings.log = console.log;
    consoleHoldings.warn = console.warn;
    consoleHoldings.error = console.error;
    consoleHoldings.group = console.group;
    consoleHoldings.groupEnd = console.groupEnd;
    consoleHoldings.groupCollapsed = console.groupCollapsed;
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.group = noop;
    console.groupEnd = noop;
    console.groupCollapsed = noop;
}

export const restoreConsole = () => {
    console.log = consoleHoldings.log;
    console.warn = consoleHoldings.warn;
    console.error = consoleHoldings.error;
    console.group = consoleHoldings.group;
    console.groupEnd = consoleHoldings.groupEnd;
    console.groupCollapsed = consoleHoldings.groupCollapsed;
}

export async function getOpenApiSpecification({ silent }: { silent?: boolean }) {
    console.log('Is silent mode:', silent);
    if (silent) setSilentMode();
    try {
        const additionals = await prepareJSDoc(options);
        return additionals;
    } finally {
        if (silent) restoreConsole();
    }
}
